import { BaseApiClient } from '@/shared/lib/api/base-client';

export interface Announcement {
    id_anuncio: string;
    titulo: string;
    contenido: string;
    fecha_creacion: string;
    autor_nombre: string;
    leido: boolean;
}

export class AnnouncementService extends BaseApiClient {
    async getAnnouncements(): Promise<Announcement[]> {
        return this.request<Announcement[]>('/api/announcement', {
            requiresAuth: true,
        });
    }

    async markAsRead(id: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/api/announcement/${id}/read`, {
            method: 'POST',
            requiresAuth: true,
        });
    }

    async createAnnouncement(titulo: string, contenido: string): Promise<{ message: string; anuncio: Announcement }> {
        return this.request<{ message: string; anuncio: Announcement }>('/api/announcement', {
            method: 'POST',
            requiresAuth: true,
            body: JSON.stringify({ titulo, contenido }),
        });
    }

    async deleteAnnouncement(id: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/api/announcement/${id}`, {
            method: 'DELETE',
            requiresAuth: true,
        });
    }
}

export const announcementService = new AnnouncementService();
