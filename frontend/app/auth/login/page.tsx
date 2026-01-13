'use client';
import { useState } from 'react';
import { authService } from '@/services';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password }); 
      login(data);
      router.push('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-10 border border-gray-200 animate-in fade-in zoom-in duration-500">
        
        {/* Encabezado con alto contraste */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter italic">
            KEMAK<span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[3px]">
            Gestión ERP de Licores y Servicios
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-xl shadow-sm font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="admin@kemak.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-gray-200 transition-all transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-3 uppercase text-xs tracking-[2px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Validando...
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Kemak Multiplataforma © 2026 - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}