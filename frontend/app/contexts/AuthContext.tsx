'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'dean' | 'student';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    let role: 'admin' | 'teacher' | 'dean' | 'student' = 'student';
    
    if (email.includes('admin')) role = 'admin';
    else if (email.includes('teacher') || email.includes('profesor')) role = 'teacher';
    else if (email.includes('dean') || email.includes('decano')) role = 'dean';
    
    const userData: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    const userData: User = {
      id: Date.now().toString(),
      name,
      email,
      role: role as 'admin' | 'teacher' | 'dean' | 'student',
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

