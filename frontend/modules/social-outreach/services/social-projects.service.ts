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
      body: data,
      requiresAuth: true,
    });
  }
}

export const socialProjectsService = new SocialProjectsService();
