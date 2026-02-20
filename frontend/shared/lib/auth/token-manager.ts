/**
 * Token Manager
 * Handles JWT token storage and retrieval
 */

const TOKEN_KEY = 'auth_token';

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class TokenManager {
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload) return false;

      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      }

      return true;
    } catch {
      return false;
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JWTPayload;
    } catch {
      return null;
    }
  }

  static getUserFromToken(): JWTPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  static getUserId(): string | null {
    const user = this.getUserFromToken();
    return user?.id || null;
  }

  static getUserEmail(): string | null {
    const user = this.getUserFromToken();
    return user?.email || null;
  }
}
