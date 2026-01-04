import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, VerifyOtpRequest, AuthResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ telefono: string }>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>;
  resendOtp: (telefono: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch {
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data, false);
    localStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.post<{ telefono: string }>('/auth/register', data, false);
    return response;
  };

  const verifyOtp = async (data: VerifyOtpRequest) => {
    const response = await api.post<AuthResponse>('/auth/verify-otp', data, false);
    localStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  };

  const resendOtp = async (telefono: string) => {
    await api.post('/auth/resend-otp', { telefono }, false);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
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
