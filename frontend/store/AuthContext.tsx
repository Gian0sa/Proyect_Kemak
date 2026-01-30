'use client'; 
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse } from '@/services/auth.service';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data);
    

    localStorage.setItem('auth', JSON.stringify(data));

    Cookies.set('auth_token', data.token, { 
      expires: 1, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    Cookies.remove('auth_token');
    
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto en cualquier parte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};