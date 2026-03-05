/**
 * Persons Service
 * Handles all person-related API calls (teachers, students)
 */

import { BaseApiClient } from '@/shared/lib/api/base-client';
import type { Teacher, Student, Person } from '../types';
import type { PaginationParams, PaginationResponse } from '@/shared/types/common';

export interface TeachersResponse {
  teachers: any[];
  pagination: any;
}

export interface StudentsResponse {
  students: any[];
  pagination: any;
}

export class PersonsService extends BaseApiClient {
  async getTeachers(
    params: PaginationParams & { search?: string; role?: string; faculty?: string } = {}
  ): Promise<TeachersResponse> {
    const { page = 1, limit = 10, search, role, faculty } = params;
    let url = `/api/persons/teachers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role && role !== 'all') url += `&role=${encodeURIComponent(role)}`;
    if (faculty && faculty !== 'all') url += `&faculty=${encodeURIComponent(faculty)}`;

    return this.request<TeachersResponse>(url, {
      requiresAuth: true,
    });
  }

  async getStudents(
    params: PaginationParams & { search?: string; program?: string; faculty?: string } = {}
  ): Promise<StudentsResponse> {
    const { page = 1, limit = 10, search, program, faculty } = params;
    let url = `/api/persons/students?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (program && program !== 'all') url += `&program=${encodeURIComponent(program)}`;
    if (faculty && faculty !== 'all') url += `&faculty=${encodeURIComponent(faculty)}`;

    return this.request<StudentsResponse>(url, {
      requiresAuth: true,
    });
  }

  async getPersonById(id: string): Promise<Person> {
    return this.request<Person>(`/api/persons/${id}`, {
      requiresAuth: true,
    });
  }

  async createTeacher(data: any): Promise<any> {
    return this.request<any>('/api/persons/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async createStudent(data: any): Promise<any> {
    return this.request<any>('/api/persons/students', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async updatePerson(id: string | number, data: any): Promise<any> {
    return this.request<any>(`/api/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async deletePerson(id: string | number): Promise<any> {
    return this.request<any>(`/api/persons/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }
}

export const personsService = new PersonsService();
