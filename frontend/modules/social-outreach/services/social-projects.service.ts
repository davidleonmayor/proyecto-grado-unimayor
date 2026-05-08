/**
 * Projects Service
 * Handles all project-related API calls
 */

import { BaseApiClient } from "@/shared/lib/api/base-client";
import type {
  Project,
  ProjectHistory,
  ProjectFormData,
  Status,
  IterationData,
  ReviewData,
  DashboardStats,
} from "../types";
import type { BulkUploadSummary } from "@/shared/types/common";

export class SocialProjectsService extends BaseApiClient {
  async getAllProjects(): Promise<any[]> {
    return this.request<any[]>("/api/proyeccion-social/", {
      requiresAuth: true,
    });
  }

  async getProjectById(id: string): Promise<any> {
    return this.request<any>(`/api/proyeccion-social/${id}`, {
      requiresAuth: true,
    });
  }

  async updateProject(id: string, data: any): Promise<any> {
    return this.request<any>(`/api/proyeccion-social/${id}`, {
      method: "PUT",
      body: data,
      requiresAuth: true,
    });
  }

  async createProject(data: any): Promise<any> {
    return this.request<any>("/api/proyeccion-social/manual", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async bulkUploadProjects(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.requestFormData<any>("/api/proyeccion-social/bulk-upload", formData, {
      requiresAuth: true,
    });
  }

  async downloadBulkTemplate(): Promise<void> {
    return this.downloadFile(
      "/api/proyeccion-social/bulk-template",
      "plantilla-proyeccion-social.xlsx",
    );
  }

  async downloadHistoryFile(historyId: string): Promise<void> {
    return super.downloadFile(
      `/api/proyeccion-social/history/${historyId}/file`,
      `archivo-${historyId}.pdf`,
    );
  }
}

export const socialProjectsService = new SocialProjectsService();
