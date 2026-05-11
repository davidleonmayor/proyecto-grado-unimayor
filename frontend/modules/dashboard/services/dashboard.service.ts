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

    async getSocialProjectionDashboard(): Promise<SocialProjectionDashboardStats> {
        return this.request<SocialProjectionDashboardStats>(
            '/api/proyeccion-social/dashboard',
            { requiresAuth: true }
        );
    }
}

export const dashboardService = new DashboardService();
