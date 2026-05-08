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
}

export const socialProjectsService = new SocialProjectsService();
