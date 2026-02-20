/**
 * Projects module types
 */

export interface Project {
  id: string;
  title: string;
  status: string;
  role: string;
  modality: string;
  lastUpdate: string;
  [key: string]: any;
}

export interface ProjectHistory {
  id: string;
  description: string;
  fecha: string;
  file_url?: string;
  [key: string]: any;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  studentId?: string;
  advisorId?: string;
  programId?: string;
  modalityId?: string;
  [key: string]: any;
}

export interface Status {
  id_estado_tg: string;
  nombre_estado: string;
}

export interface IterationData {
  file: File;
  description: string;
  numero_resolucion?: string;
}

export interface ReviewData {
  description: string;
  newStatusId?: string;
  numero_resolucion?: string;
  file?: File;
  actionType?: string;
}

export interface DashboardStats {
  totalProjects: number;
  byStatus: Record<string, number>;
  byModality: Record<string, number>;
  [key: string]: any;
}
