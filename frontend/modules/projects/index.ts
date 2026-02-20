/**
 * Projects Module Exports
 */

export { projectsService } from './services/projects.service';
export { ProjectHistory } from './components/ProjectHistory';
export { BulkUploadProjects } from './components/BulkUploadProjects';
export type {
  Project,
  ProjectHistory as ProjectHistoryType,
  ProjectFormData,
  Status,
  IterationData,
  ReviewData,
  DashboardStats,
} from './types';
