/**
 * Common types used across the application
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface BulkUploadRowResult {
  row: number;
  status: 'success' | 'error';
  title?: string;
  messages: string[];
}

export interface BulkUploadSummary {
  totalRows: number;
  imported: number;
  failed: number;
  rows: BulkUploadRowResult[];
}
