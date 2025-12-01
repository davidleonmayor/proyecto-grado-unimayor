// API client utility for making requests to the backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...restOptions } = options;

    const config: RequestInit = {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof data === 'object' && data.error
            ? data.error
            : typeof data === 'string'
              ? data
              : 'Error en la solicitud'
        );
      }

      return data as T;
    } catch (error) {
      // Handle network errors (connection refused, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  // Auth endpoints
  async register(data: {
    names: string;
    lastNames: string;
    typeOfDentityDocument: string;
    idDocumentNumber: string;
    phoneNumber: string;
    email: string;
    password: string;
  }): Promise<string> {
    return this.request<string>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmAccount(token: string): Promise<string> {
    return this.request<string>('/api/auth/confirm-account', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async login(email: string, password: string): Promise<string> {
    return this.request<string>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async forgotPassword(email: string): Promise<string> {
    return this.request<string>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async validateToken(token: string): Promise<string> {
    return this.request<string>('/api/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resetPassword(token: string, password: string): Promise<string> {
    return this.request<string>(`/api/auth/${token}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword: password }),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/api/auth/user', {
      requiresAuth: true,
    });
  }

  async updatePassword(currentPassword: string, password: string): Promise<string> {
    return this.request<string>('/api/auth/update-password', {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify({ currentPassword, password, confirmPassword: password }),
    });
  }

  // Project endpoints
  async getProjects(): Promise<any[]> {
    return this.request<any[]>('/api/projects', {
      requiresAuth: true,
    });
  }

  async getProjectHistory(projectId: string): Promise<any[]> {
    return this.request<any[]>(`/api/projects/${projectId}/history`, {
      requiresAuth: true,
    });
  }

  async createIteration(projectId: string, file: File, description: string, numero_resolucion?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    if (numero_resolucion) {
      formData.append('numero_resolucion', numero_resolucion);
    }

    // Custom request for FormData
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/iteration`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al crear entrega');
    }

    return response.json();
  }

  async reviewIteration(projectId: string, description: string, newStatusId?: string, numero_resolucion?: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/review`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ description, newStatusId, numero_resolucion }),
    });
  }

  // Download file with authentication
  async downloadFile(historyId: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    try {
      const response = await fetch(
        `${this.baseURL}/api/projects/history/${historyId}/download`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || 'Error al descargar el archivo'
        );
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'archivo.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al descargar el archivo');
    }
  }

  getDownloadUrl(historyId: string): string {
    return `${this.baseURL}/api/projects/history/${historyId}/download`;
  }

  // Admin CRUD operations (Privileged users only)
  async getAllProjects(): Promise<any[]> {
    return this.request<any[]>('/api/projects/admin/all', {
      requiresAuth: true,
    });
  }

  async createProject(projectData: any): Promise<any> {
    return this.request<any>('/api/projects/admin', {
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

  async updateProject(projectId: string, projectData: any): Promise<any> {
    return this.request<any>(`/api/projects/admin/${projectId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/admin/${projectId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // Get available statuses (for review form)
  async getStatuses(): Promise<Array<{ id_estado_tg: string; nombre_estado: string }>> {
    return this.request<Array<{ id_estado_tg: string; nombre_estado: string }>>('/api/projects/statuses', {
      requiresAuth: true,
    });
  }

  // Helper endpoints for forms
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

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/api/projects/stats/dashboard', {
      requiresAuth: true,
    });
  }

  // Teacher/Director dashboard statistics
  async getTeacherDashboardStats(): Promise<any> {
    return this.request<any>('/api/projects/stats/teacher-dashboard', {
      requiresAuth: true,
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
