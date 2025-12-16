/**
 * Authentication module types
 */

export interface User {
  id_persona: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  numero_celular: string;
  num_doc_identidad: string;
}

export interface RegisterData {
  names: string;
  lastNames: string;
  typeOfDentityDocument: string;
  idDocumentNumber: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
