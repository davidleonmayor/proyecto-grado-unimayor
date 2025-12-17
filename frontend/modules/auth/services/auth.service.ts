/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { BaseApiClient } from '@/shared/lib/api/base-client';
import type { RegisterData, LoginCredentials, User } from '../types';

export class AuthService extends BaseApiClient {
  async register(data: RegisterData): Promise<string> {
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

  async login(credentials: LoginCredentials): Promise<string> {
    return this.request<string>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/user', {
      requiresAuth: true,
    });
  }

  async updatePassword(
    currentPassword: string,
    password: string
  ): Promise<string> {
    return this.request<string>('/api/auth/update-password', {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify({
        currentPassword,
        password,
        confirmPassword: password,
      }),
    });
  }
}

export const authService = new AuthService();
