// Authentication utilities for token management and JWT decoding

const TOKEN_KEY = 'auth_token';

interface JWTPayload {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Token storage functions
export const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = decodeToken(token);
        if (!payload) return false;

        // Check if token is expired
        if (payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        }

        return true;
    } catch {
        return false;
    }
};

// Decode JWT token (simple base64 decode, not verification)
export const decodeToken = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded) as JWTPayload;
    } catch {
        return null;
    }
};

// Get user info from token
export const getUserFromToken = (): JWTPayload | null => {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
};

// Get user ID from token
export const getUserId = (): string | null => {
    const user = getUserFromToken();
    return user?.id || null;
};

// Get user email from token
export const getUserEmail = (): string | null => {
    const user = getUserFromToken();
    return user?.email || null;
};
