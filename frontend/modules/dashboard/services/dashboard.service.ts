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
}

export class DashboardService extends BaseApiClient {
    async getDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>('/api/projects/stats/dashboard', {
            requiresAuth: true,
        });
    }

    async getTeacherDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>(
            '/api/projects/stats/teacher-dashboard',
            {
                requiresAuth: true,
            }
        );
    }

    async getSocialProjectionDashboard(): Promise<SocialProjectionDashboardStats> {
        return this.request<SocialProjectionDashboardStats>(
            '/api/social-projection/dashboard',
            { requiresAuth: true }
        );
    }
}

export const dashboardService = new DashboardService();
