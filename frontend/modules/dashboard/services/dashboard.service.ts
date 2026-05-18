import { BaseApiClient } from '@/shared/lib/api/base-client';

export interface DashboardStats {
    counts: {
        projects: number;
        teachers: number;
        students: number;
        events: number;
    };
    projectsByStatus: Array<{ status: string; count: number }>;
    projectsByProgram: Array<{ program: string; count: number }>;
    recentActivity: Array<{ id: string; user: string; action: string; date: string }>;
}

export interface SocialProjectionDashboardStats {
    totalProjects: number;
    totalImpactadas: number;
    weeklyImpact: Array<{ name: string; personas_impactadas: number }>;
    status?: {
        finalizados: number;
        sinEntregar: number;
        total: number;
        porcentajeFinalizado: number;
        porcentajeSinEntregar: number;
    };
    monthlyFinalized?: Array<{ name: string; finalizados: number }>;
}

export class DashboardService extends BaseApiClient {
    async getDashboardStats(modality?: string): Promise<DashboardStats> {
        const query = modality ? `?modality=${encodeURIComponent(modality)}` : '';
        return this.request<DashboardStats>(`/api/projects/stats/dashboard${query}`, {
            requiresAuth: true,
        });
    }

    async getTeacherDashboardStats(modality?: string): Promise<DashboardStats> {
        const query = modality ? `?modality=${encodeURIComponent(modality)}` : '';
        return this.request<DashboardStats>(
            `/api/projects/stats/teacher-dashboard${query}`,
            {
                requiresAuth: true,
            }
        );
    }

    async getSocialProjectionDashboard(filters?: {
        fecha_inicio?: string;
        fecha_fin?: string;
        id_facultad?: string;
        id_programa?: string;
    }): Promise<SocialProjectionDashboardStats> {
        const params = new URLSearchParams();
        if (filters?.fecha_inicio) params.set('fecha_inicio', filters.fecha_inicio);
        if (filters?.fecha_fin) params.set('fecha_fin', filters.fecha_fin);
        if (filters?.id_facultad) params.set('id_facultad', filters.id_facultad);
        if (filters?.id_programa) params.set('id_programa', filters.id_programa);

        const query = params.toString();
        const url = `/api/proyeccion-social/dashboard${query ? `?${query}` : ''}`;

        return this.request<SocialProjectionDashboardStats>(url, {
            requiresAuth: true,
        });
    }
}

export const dashboardService = new DashboardService();
