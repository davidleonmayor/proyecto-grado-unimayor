/**
 * Shared Module Exports
 */

// Components
export { InputField } from './components/ui/InputField';
export { LegacyTable } from './components/ui/LegacyTable';
export { Pagination } from './components/ui/Pagination';
export { TableSearch } from './components/ui/TableSearch';
export { ProtectedRoute } from './components/layout/ProtectedRoute';
export { RoleProtectedRoute } from './components/layout/RoleProtectedRoute';
export { Menu } from './components/layout/Menu';
export { Navbar } from './components/layout/Navbar';

// Hooks
export { useUserRole } from './hooks/useUserRole';

// Lib
export { TokenManager } from './lib/auth/token-manager';
export { BaseApiClient } from './lib/api/base-client';

// Types
export type {
  PaginationParams,
  PaginationResponse,
  ApiError,
  BulkUploadSummary,
  BulkUploadRowResult,
} from './types/common';
