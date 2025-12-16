/**
 * Persons module types
 */

export interface Person {
  id: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  numero_celular?: string;
  [key: string]: any;
}

export interface Teacher extends Person {
  role?: string;
  faculty?: string;
}

export interface Student extends Person {
  program?: string;
  faculty?: string;
}
