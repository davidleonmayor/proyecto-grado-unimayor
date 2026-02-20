'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { messagingService, MensajeEntrega, ConversationSummary } from '../services/messaging.service';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useMessaging = () => {
    const { isAuth } = useAuth();
    const [messages, setMessages] = useState<MensajeEntrega[]>([]);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Full fetch (inbox + conversations) — used on dropdown open and after sending
    const fetchInbox = useCallback(async () => {
        if (!isAuth) return;
        try {
            setLoading(true);
            setError(null);
            const [inboxData, convData] = await Promise.all([
                messagingService.getInbox(),
                messagingService.getRecentConversations()
            ]);
            setMessages(inboxData);
            setConversations(convData);
            // Update unread count from conversations
            const total = convData.reduce((acc, c) => acc + c.unreadCount, 0);
            setUnreadCount(total);
        } catch (err: any) {
            setError(err.message || 'Error fetching messages');
        } finally {
            setLoading(false);
        }
    }, [isAuth]);

    // Lightweight poll: only fetch the unread count (efficient, runs every 5s)
    const pollUnreadCount = useCallback(async () => {
        if (!isAuth) return;
        try {
            const data = await messagingService.getUnreadCount();
            setUnreadCount(prev => {
                if (data.unreadCount !== prev) return data.unreadCount;
                return prev;
            });
        } catch {
            // Silent fail for polling
        }
    }, [isAuth]);

    // Start polling on mount
    useEffect(() => {
        if (!isAuth) return;

        // Initial fetch
        fetchInbox();

        // Poll unread count every 5 seconds
        pollingRef.current = setInterval(pollUnreadCount, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [isAuth, fetchInbox, pollUnreadCount]);

    const sendMessage = async (content: string, targetRole?: string) => {
        try {
            await messagingService.sendMessage({ content, targetRole });
            setTimeout(fetchInbox, 1000);
        } catch (err: any) {
            throw new Error(err.message || 'Error sending message');
        }
    };

    return {
        messages,
        conversations,
        loading,
        error,
        refresh: fetchInbox,
        sendMessage,
        unreadCount
    };
};
