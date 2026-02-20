# Projects Module — `modules/projects/`

Project management module: services, components, types, and page flows.

## References

| Resource | Description | Path |
|----------|-------------|------|
| Projects service | API calls for projects | `frontend/modules/projects/services/projects.service.ts` |
| ProjectHistory component | History timeline | `frontend/modules/projects/components/ProjectHistory.tsx` |
| BulkUploadProjects component | Excel upload | `frontend/modules/projects/components/BulkUploadProjects.tsx` |
| Projects list page | User's projects | `frontend/app/(dashboard)/projects/page.tsx` |
| Project detail page | Single project view | `frontend/app/(dashboard)/projects/[id]/page.tsx` |
| Admin new project | Create project form | `frontend/app/(dashboard)/projects/admin/new/page.tsx` |
| Admin edit project | Edit project form | `frontend/app/(dashboard)/projects/admin/edit/[id]/page.tsx` |
| Bulk upload page | Excel bulk import | `frontend/app/(dashboard)/projects/bulk-upload/page.tsx` |

## Directory Structure

```
modules/projects/
├── index.ts                         # Barrel exports
├── services/
│   └── projects.service.ts          # API calls extending BaseApiClient
├── components/
│   ├── ProjectHistory.tsx           # History timeline component
│   └── BulkUploadProjects.tsx       # Excel bulk upload component
└── types/
    └── index.ts                     # Project, ProjectHistory, Status, etc.
```

## Service — `ProjectsService`

Extends `BaseApiClient`. Singleton exported as `projectsService`.

### User Operations

| Method | API Call | Description |
|--------|----------|-------------|
| `getProjects()` | GET `/api/projects` | Get user's projects |
| `getProjectHistory(projectId)` | GET `/api/projects/{projectId}/history` | Get project history |

### Iteration & Review

| Method | API Call | Description |
|--------|----------|-------------|
| `createIteration(projectId, data)` | POST `/api/projects/{projectId}/iteration` | Upload iteration (FormData with file) |
| `reviewIteration(projectId, data)` | POST `/api/projects/{projectId}/review` | Submit review |
| `downloadFile(historyId)` | GET `/api/projects/history/{historyId}/download` | Download PDF file |
| `getDownloadUrl(historyId)` | — | Returns download URL string |

### Admin Operations

| Method | API Call | Description |
|--------|----------|-------------|
| `getAllProjects()` | GET `/api/projects/admin/all` | List all projects |
| `createProject(data)` | POST `/api/projects/admin` | Create new project |
| `getProjectById(id)` | GET `/api/projects/admin/{projectId}` | Get project details |
| `updateProject(id, data)` | PUT `/api/projects/admin/{projectId}` | Update project |
| `deleteProject(id)` | DELETE `/api/projects/admin/{projectId}` | Delete project |
| `downloadBulkTemplate()` | — | Download Excel template |
| `bulkUploadProjects(file)` | POST `/api/projects/admin/bulk-upload` | Bulk import from Excel |

### Form Data & Stats

| Method | API Call | Description |
|--------|----------|-------------|
| `getStatuses()` | GET `/api/projects/statuses` | Get all project statuses |
| `getFormData()` | GET `/api/projects/form-data` | Get form dropdown data |
| `getAvailableStudents(programId?)` | GET `/api/projects/students` | Available students |
| `getAvailableAdvisors()` | GET `/api/projects/advisors` | Available advisors |
| `getDashboardStats()` | GET `/api/projects/stats/dashboard` | Admin dashboard stats |
| `getTeacherDashboardStats()` | GET `/api/projects/stats/teacher-dashboard` | Teacher stats |

## Types

```typescript
interface Project {
  id: string;
  title: string;
  status: string;
  role: string;
  modality: string;
  lastUpdate: string;
}

interface ProjectHistory {
  id: string;
  description: string;
  fecha: string;
  file_url?: string;
}

interface Status {
  id_estado_tg: string;
  nombre_estado: string;
}

interface IterationData {
  file: File;
  description: string;
  numero_resolucion?: string;
}

interface ReviewData {
  description: string;
  newStatusId?: string;
  numero_resolucion?: string;
  file?: File;
  actionType?: string;
}

interface DashboardStats {
  totalProjects: number;
  byStatus: Record<string, number>;
  byModality: Record<string, number>;
}
```

## Pages

### Projects List (`/projects`)
- Fetches projects via `projectsService.getProjects()`
- Shows project cards with status badge (color-coded), modality, role
- Admin buttons (visible for Director role): New, Bulk Upload, Manage
- Each card links to `/dashboard/projects/{projectId}`

### Project Detail (`/projects/[id]`)
- Shows project info, history timeline, file downloads
- Iteration upload (for students)
- Review section (for directors)

### Admin New Project (`/projects/admin/new`)
- Form with: title, modality, status, students, advisors
- Dropdown data loaded from `getFormData()` and `getStatuses()`

### Admin Edit Project (`/projects/admin/edit/[id]`)
- Same form as new, pre-filled with existing data
- Uses `getProjectById()` then `updateProject()`

### Bulk Upload (`/projects/bulk-upload`)
- Excel file upload with template download
- Shows upload results: success/error per row
- Uses `BulkUploadProjects` component

## Status Colors

| Status | Color |
|--------|-------|
| Approved | Green (`#0ea5e9`) |
| Rejected | Red (`#f44336`) |
| Pending | Yellow (`#fcdf5d`) |
