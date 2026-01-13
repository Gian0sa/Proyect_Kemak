import api from '@/lib/axios';

// Interfaces basadas en tus DTOs de C#
export interface UsuarioCreateDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  roles: string[];
}

export const authService = {
  // POST: api/Auth/registrar
registrar: async (dto: UsuarioCreateDto): Promise<{ mensaje: string }> => {
    const { data } = await api.post('/Auth/registrar', dto);
    return data;
},

  // POST: api/Auth/login
login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/Auth/login', dto);
    
    if (data.token) {
      // Guardamos la respuesta completa para tener acceso a los roles en el Dashboard
    localStorage.setItem('auth', JSON.stringify(data));
    }
    return data;
},

  // Logout del lado del cliente y servidor
logout: async () => {
    try {
      await api.post('/Auth/logout'); // Avisamos al backend
    } catch (error) {
    console.error("Error al notificar logout al servidor", error);
    } finally {
    localStorage.removeItem('auth');
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
    }
    }
},

getCurrentUser: (): AuthResponse | null => {
    if (typeof window === 'undefined') return null;
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
}
};