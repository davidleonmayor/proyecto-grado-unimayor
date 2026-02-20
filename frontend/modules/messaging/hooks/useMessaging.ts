'use client';

import { useState, useCallback, useEffect } from 'react';
import { messagingService, MensajeEntrega, ConversationSummary } from '../services/messaging.service';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useMessaging = () => {
    const { isAuth } = useAuth();
    const [messages, setMessages] = useState<MensajeEntrega[]>([]);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        } catch (err: any) {
            setError(err.message || 'Error fetching messages');
        } finally {
            setLoading(false);
        }
    }, [isAuth]);

    useEffect(() => {
        fetchInbox();
    }, [fetchInbox]);

    const sendMessage = async (content: string, targetRole?: string) => {
        try {
            await messagingService.sendMessage({ content, targetRole });
            setTimeout(fetchInbox, 1000);
        } catch (err: any) {
            throw new Error(err.message || 'Error sending message');
        }
    };

    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    return {
        messages,
        conversations,
        loading,
        error,
        refresh: fetchInbox,
        sendMessage,
        unreadCount: totalUnread
    };
};
