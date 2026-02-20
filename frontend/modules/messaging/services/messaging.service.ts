import { BaseApiClient } from '@/shared/lib/api/base-client';

export interface PersonaMin {
    id_persona: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
}

export interface MensajeObj {
    id_mensaje: string;
    contenido: string;
    id_emisor: string;
    fecha_envio: string;
    emisor: PersonaMin;
}

export interface MensajeEntrega {
    id_entrega: string;
    id_mensaje: string;
    id_receptor: string;
    estado: 'PENDING' | 'DELIVERED' | 'READ';
    fecha_lectura: string | null;
    mensaje: MensajeObj;
}

export interface SendMessagePayload {
    content: string;
    targetRole?: string;
    targetUserId?: string;
}

export interface DirectMessage {
    id_entrega: string;
    id_mensaje: string;
    contenido: string;
    id_emisor: string;
    estado: string;
    fecha: string;
    soy_emisor: boolean;
}

export interface ConversationSummary {
    peerId: string;
    peerName: string;
    peerEmail: string;
    peerInitials: string;
    lastMessage: string;
    lastMessageDate: string;
    lastMessageIsMine: boolean;
    unreadCount: number;
}

export class MessagingService extends BaseApiClient {
    async getInbox(): Promise<MensajeEntrega[]> {
        return this.request<MensajeEntrega[]>('/api/messaging/inbox', {
            requiresAuth: true
        });
    }

    async sendMessage(payload: SendMessagePayload): Promise<any> {
        return this.request<any>('/api/messaging/send', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true
        });
    }

    async getFacultyPeers(): Promise<PersonaMin[]> {
        return this.request<PersonaMin[]>('/api/messaging/users', {
            requiresAuth: true
        });
    }

    async getConversation(userId: string): Promise<DirectMessage[]> {
        return this.request<DirectMessage[]>(`/api/messaging/conversation/${userId}`, {
            requiresAuth: true
        });
    }

    async getRecentConversations(): Promise<ConversationSummary[]> {
        return this.request<ConversationSummary[]>('/api/messaging/conversations', {
            requiresAuth: true
        });
    }

    async getUnreadCount(): Promise<{ unreadCount: number }> {
        return this.request<{ unreadCount: number }>('/api/messaging/unread-count', {
            requiresAuth: true
        });
    }

    async markConversationRead(userId: string): Promise<{ markedRead: number }> {
        return this.request<{ markedRead: number }>(`/api/messaging/conversation/${userId}/read`, {
            method: 'PUT',
            requiresAuth: true
        });
    }
}

export const messagingService = new MessagingService();
