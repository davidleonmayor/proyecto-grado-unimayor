'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { messagingService, PersonaMin, DirectMessage, ConversationSummary } from '../services/messaging.service';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Image from 'next/image';
import avatarImage from '@/public/avatar.png';
import { useRouter } from 'next/navigation';

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    initialPeer?: PersonaMin | null;
    onMessageSent?: () => void;
}

type TabType = 'recents' | 'contacts';

export const ChatWidget = ({ isOpen, onClose, initialPeer, onMessageSent }: ChatWidgetProps) => {
    const { user, isAuth } = useAuth();
    const router = useRouter();
    const [peers, setPeers] = useState<PersonaMin[]>([]);
    const [recentConvos, setRecentConvos] = useState<ConversationSummary[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('recents');
    const [activeChatUser, setActiveChatUser] = useState<PersonaMin | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Open directly to a specific peer if initialPeer is provided
    useEffect(() => {
        if (isOpen && initialPeer) {
            setActiveChatUser(initialPeer);
        }
    }, [isOpen, initialPeer]);

    // Fetch data when widget opens
    useEffect(() => {
        if (isOpen && isAuth) {
            loadRecentConvos();
        }
    }, [isOpen, isAuth]);

    // Load conversation when active user changes + start polling
    useEffect(() => {
        if (activeChatUser) {
            loadConversation(activeChatUser.id_persona);
            startPolling(activeChatUser.id_persona);
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [activeChatUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset state when widget closes
    useEffect(() => {
        if (!isOpen) {
            setActiveChatUser(null);
            setMessages([]);
            setInputMessage('');
            stopPolling();
        }
    }, [isOpen]);

    // Real-time polling every 3 seconds
    const startPolling = useCallback((userId: string) => {
        stopPolling();
        pollingRef.current = setInterval(async () => {
            try {
                const data = await messagingService.getConversation(userId);
                setMessages(prev => {
                    // Only update if there are new messages (avoid unnecessary re-renders)
                    if (data.length !== prev.length) return data;
                    const lastNew = data[data.length - 1];
                    const lastOld = prev[prev.length - 1];
                    if (lastNew?.id_entrega !== lastOld?.id_entrega) return data;
                    return prev;
                });
            } catch (error) {
                // Silent fail for polling
            }
        }, 3000);
    }, []);

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const loadPeers = async () => {
        setLoading(true);
        try {
            const data = await messagingService.getFacultyPeers();
            setPeers(data);
        } catch (error) {
            console.error('Error loading contacts', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentConvos = async () => {
        try {
            const data = await messagingService.getRecentConversations();
            setRecentConvos(data);
        } catch (error) {
            console.error('Error loading recent conversations', error);
        }
    };

    const loadConversation = async (userId: string) => {
        setLoading(true);
        try {
            const data = await messagingService.getConversation(userId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading conversation', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !activeChatUser) return;

        const content = inputMessage.trim();
        setInputMessage('');

        // Optimistically add to local state
        const optimisticMsg: DirectMessage = {
            id_entrega: `temp-${Date.now()}`,
            id_mensaje: `temp-${Date.now()}`,
            contenido: content,
            id_emisor: 'me',
            estado: 'READ',
            fecha: new Date().toISOString(),
            soy_emisor: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await messagingService.sendMessage({
                content,
                targetUserId: activeChatUser.id_persona
            });
            // Refresh from server
            setTimeout(() => {
                loadConversation(activeChatUser.id_persona);
                loadRecentConvos();
                onMessageSent?.();
            }, 500);
        } catch (error) {
            console.error('Error sending message', error);
            setMessages(prev => prev.filter(m => m.id_entrega !== optimisticMsg.id_entrega));
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'contacts' && peers.length === 0) {
            loadPeers();
        }
    };

    const selectPeerFromConvo = (conv: ConversationSummary) => {
        const fullName = conv.peerName || '';
        const nameParts = fullName.split(' ');
        setActiveChatUser({
            id_persona: conv.peerId,
            nombres: nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName,
            apellidos: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
            correo_electronico: conv.peerEmail || ''
        });
    };

    const goToProfile = (personId: string) => {
        // Navigate to the profile page — try students first, fallback to teachers
        router.push(`/list/students/${personId}`);
        onClose();
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-10 w-80 bg-white rounded-t-xl shadow-[0_4px_30px_rgb(0,0,0,0.15)] border border-gray-200 z-[9999] flex flex-col overflow-hidden" style={{ height: '450px' }}>

            {/* HEADER */}
            <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2.5 cursor-pointer min-w-0" onClick={() => activeChatUser && setActiveChatUser(null)}>
                    {activeChatUser && (
                        <svg className="w-4 h-4 text-primary-100 hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    )}
                    {activeChatUser && (
                        <div
                            className="shrink-0 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); goToProfile(activeChatUser.id_persona); }}
                            title="Ver perfil"
                        >
                            <Image src={avatarImage} alt="avatar" width={28} height={28} className="rounded-full ring-2 ring-primary-400 hover:ring-white transition-all" />
                        </div>
                    )}
                    <h3 className="font-medium text-[14px] truncate">
                        {activeChatUser
                            ? `${(activeChatUser.nombres || '').split(' ')[0]} ${(activeChatUser.apellidos || '').split(' ')[0]}`.trim() || 'Chat'
                            : 'Mensajes'}
                    </h3>
                </div>
                <button onClick={onClose} className="text-primary-100 hover:text-white transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                {!activeChatUser ? (
                    // LIST VIEW WITH TABS
                    <div className="flex flex-col h-full">
                        {/* Tab Header */}
                        <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                            <button
                                className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${activeTab === 'recents' ? 'text-primary-600 border-primary-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                                onClick={() => handleTabChange('recents')}
                            >
                                Recientes
                            </button>
                            <button
                                className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${activeTab === 'contacts' ? 'text-primary-600 border-primary-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                                onClick={() => handleTabChange('contacts')}
                            >
                                Contactos
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'recents' ? (
                                // RECENT CONVERSATIONS TAB
                                recentConvos.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-500 flex flex-col items-center gap-3 mt-4">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p>No tienes conversaciones aún.<br />Ve a <b>Contactos</b> para iniciar una.</p>
                                    </div>
                                ) : (
                                    recentConvos.map(conv => (
                                        <div
                                            key={conv.peerId}
                                            className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 hover:bg-slate-100 bg-white border-b border-gray-50 ${conv.unreadCount > 0 ? 'bg-primary-50/30' : ''}`}
                                            onClick={() => selectPeerFromConvo(conv)}
                                        >
                                            <Image src={avatarImage} alt={conv.peerName} width={36} height={36} className="rounded-full ring-2 ring-white shadow-sm shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`text-[13px] truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>{conv.peerName}</span>
                                                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">{formatTimeAgo(conv.lastMessageDate)}</span>
                                                </div>
                                                <p className={`text-[11px] line-clamp-1 ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                                    {conv.lastMessageIsMine ? 'Tú: ' : ''}{conv.lastMessage}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="w-5 h-5 flex items-center justify-center bg-primary-500 text-white rounded-full text-[9px] font-bold shrink-0">{conv.unreadCount}</div>
                                            )}
                                        </div>
                                    ))
                                )
                            ) : (
                                // CONTACTS TAB (role-based)
                                loading ? (
                                    <div className="p-4 text-center text-xs text-gray-500">Cargando contactos...</div>
                                ) : peers.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-500 flex flex-col items-center gap-3 mt-4">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p>No tienes contactos disponibles.<br />Los contactos se asignan según<br />tus proyectos de grado.</p>
                                    </div>
                                ) : (
                                    peers.map(peer => (
                                        <div
                                            key={peer.id_persona}
                                            className="px-4 py-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center gap-3 bg-white border-b border-gray-50"
                                            onClick={() => setActiveChatUser(peer)}
                                        >
                                            <Image src={avatarImage} alt={`${peer.nombres} ${peer.apellidos}`} width={36} height={36} className="rounded-full ring-2 ring-white shadow-sm shrink-0" />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[13px] font-medium text-gray-800 truncate">{peer.nombres} {peer.apellidos}</span>
                                                <span className="text-[11px] text-gray-500 truncate">{peer.correo_electronico}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    // ACTIVE CHAT VIEW
                    <div className="p-4 flex flex-col gap-3 min-h-full justify-end bg-white relative pb-14">
                        {loading && messages.length === 0 && (
                            <div className="absolute top-0 left-0 right-0 p-2 text-center text-xs text-gray-400">Cargando historial...</div>
                        )}
                        {messages.length === 0 && !loading && (
                            <div className="text-center text-xs text-gray-400 my-auto pb-10">Envía el primer mensaje a {(activeChatUser.nombres || '').split(' ')[0] || 'esta persona'}</div>
                        )}
                        {messages.map((msgBase) => {
                            const isMe = msgBase.soy_emisor;
                            return (
                                <div key={msgBase.id_entrega} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div className={`px-3 py-2 rounded-2xl text-[13px] shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'}`}>
                                        {msgBase.contenido}
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-1 px-1">{new Date(msgBase.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />

                        {/* CHAT INPUT FORM */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2.5 flex gap-2">
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-slate-50 border border-gray-200 rounded-full px-4 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-primary-300 transition-shadow"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:bg-gray-300 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
