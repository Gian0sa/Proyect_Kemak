'use client'; 
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse } from '@/services/auth.service';
import Cookies from 'js-cookie';
import { signOut } from 'next-auth/react'; // <--- IMPORTANTE

interface AuthContextType {
  user: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>; // Ahora es una Promesa
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing auth data", error);
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data);
    localStorage.setItem('auth', JSON.stringify(data));

    // Seteamos cookie para middleware o peticiones del servidor
    Cookies.set('auth_token', data.token, { 
      expires: 1, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
  };

  const logout = async () => {
    try {
      // 1. Limpiamos la sesión de Google / NextAuth
      // redirect: false evita que NextAuth te mande a su página por defecto
      await signOut({ redirect: false });

      // 2. Limpiamos el estado local de React
      setUser(null);

      // 3. Limpiamos persistencia manual
      localStorage.removeItem('auth');
      Cookies.remove('auth_token');

      // 4. Redirección limpia al Login
      // Usamos replace para que el usuario no pueda darle "atrás" y volver al dashboard
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error("Error durante el logout:", error);
      // Fallback: si falla signOut, igual limpiamos lo local
      localStorage.removeItem('auth');
      window.location.href = '/auth/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};