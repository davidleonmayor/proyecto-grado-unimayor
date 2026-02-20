/**
 * Projects Service
 * Handles all project-related API calls
 */

import { BaseApiClient } from '@/shared/lib/api/base-client';
import type {
  Project,
  ProjectHistory,
  ProjectFormData,
  Status,
  IterationData,
  ReviewData,
  DashboardStats,
} from '../types';
import type { BulkUploadSummary } from '@/shared/types/common';

export class ProjectsService extends BaseApiClient {
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects', {
      requiresAuth: true,
    });
  }

  async getProjectHistory(projectId: string): Promise<ProjectHistory[]> {
    return this.request<ProjectHistory[]>(
      `/api/projects/${projectId}/history`,
      {
        requiresAuth: true,
      }
    );
  }

  async createIteration(
    projectId: string,
    data: IterationData
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('description', data.description);
    if (data.numero_resolucion) {
      formData.append('numero_resolucion', data.numero_resolucion);
    }

    return this.requestFormData<any>(
      `/api/projects/${projectId}/iteration`,
      formData,
      {
        method: 'POST',
        requiresAuth: true,
      }
    );
  }

  async reviewIteration(
    projectId: string,
    data: ReviewData
  ): Promise<any> {
    if (data.file) {
      const formData = new FormData();
      formData.append('description', data.description);
      if (data.newStatusId) {
        formData.append('newStatusId', data.newStatusId);
      }
      if (data.numero_resolucion) {
        formData.append('numero_resolucion', data.numero_resolucion);
      }
      if (data.actionType) {
        formData.append('actionType', data.actionType);
      }
      formData.append('file', data.file);

      return this.requestFormData<any>(
        `/api/projects/${projectId}/review`,
        formData,
        {
          method: 'POST',
          requiresAuth: true,
        }
      );
    } else {
      return this.request<any>(`/api/projects/${projectId}/review`, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          description: data.description,
          newStatusId: data.newStatusId,
          numero_resolucion: data.numero_resolucion,
          actionType: data.actionType,
        }),
      });
    }
  }

  async downloadFile(historyId: string): Promise<void> {
    return super.downloadFile(
      `/api/projects/history/${historyId}/download`,
      'archivo.pdf'
    );
  }

  getDownloadUrl(historyId: string): string {
    return `${this.baseURL}/api/projects/history/${historyId}/download`;
  }

  // Admin operations
  async getAllProjects(): Promise<any[]> {
    return this.request<any[]>('/api/projects/admin/all', {
      requiresAuth: true,
    });
  }

  async createProject(projectData: ProjectFormData): Promise<Project> {
    return this.request<Project>('/api/projects/admin', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(projectData),
    });
  }

  async getProjectById(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/admin/${projectId}`, {
      requiresAuth: true,
    });
  }

  async updateProject(
    projectId: string,
    projectData: Partial<ProjectFormData>
  ): Promise<Project> {
    return this.request<Project>(`/api/projects/admin/${projectId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.request<void>(`/api/projects/admin/${projectId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async downloadBulkTemplate(): Promise<void> {
    return super.downloadFile(
      '/api/projects/admin/bulk-template',
      'bulk-projects-sample.xlsx'
    );
  }

  async bulkUploadProjects(file: File): Promise<BulkUploadSummary> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(
        `${this.baseURL}/api/projects/admin/bulk-upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const looksLikeSummary =
          data &&
          typeof data === 'object' &&
          'rows' in data &&
          Array.isArray((data as any).rows);

        if (looksLikeSummary) {
          return data as BulkUploadSummary;
        }

        throw new Error(
          typeof data === 'object' && data !== null && 'error' in data
            ? (data as { error: string }).error
            : 'Error al importar proyectos'
        );
      }

      return data as BulkUploadSummary;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al importar proyectos');
    }
  }

  async getStatuses(): Promise<Status[]> {
    return this.request<Status[]>('/api/projects/statuses', {
      requiresAuth: true,
    });
  }

  async getFormData(): Promise<any> {
    return this.request<any>('/api/projects/form-data', {
      requiresAuth: true,
    });
  }

  async getAvailableStudents(programId?: string): Promise<any[]> {
    const url = programId
      ? `/api/projects/students?programId=${programId}`
      : '/api/projects/students';
    return this.request<any[]>(url, {
      requiresAuth: true,
    });
  }

  async getAvailableAdvisors(): Promise<any[]> {
    return this.request<any[]>('/api/projects/advisors', {
      requiresAuth: true,
    });
  }


}

export const projectsService = new ProjectsService();
