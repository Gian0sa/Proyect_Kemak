'use client';
import { useState } from 'react';
import { authService } from '@/services';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Lock, 
  Mail, 
  ArrowLeft, 
  UserPlus, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react'; 
import Link from 'next/link'; 

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
      const isAdmin = data.roles.some(role => role.toLowerCase() === 'admin');
      
      if (isAdmin) {
        router.push('/dashboard'); 
      } else {
        router.push('/'); 
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden font-sans">
      
      {/* FONDO DINÁMICO (Luces de acento como en el Hero) */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* BOTÓN VOLVER - DISEÑO MEJORADO */}
      <Link 
        href="/" 
        className="absolute top-10 left-10 z-20 flex items-center gap-3 text-slate-400 hover:text-orange-600 transition-all group"
      >
        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-orange-200 group-hover:shadow-lg transition-all border border-slate-100">
          <ArrowLeft size={18} />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden md:block">Regresar</span>
      </Link>

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl shadow-slate-200/50 p-10 md:p-16 border border-white relative">
          
          {/* LOGO E INDICADOR */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-lg shadow-slate-200">
               <ShieldCheck size={14} className="text-orange-500" /> Secure Access
            </div>
            <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter italic leading-none">
              KEMAK<span className="text-orange-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-4">
              Corporación & Sistemas ERP
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 rounded-2xl text-xs font-black uppercase tracking-tight flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-orange-600 transition-colors">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="ejemplo@kemak.com"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-orange-600 transition-colors">
                  Contraseña
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-[9px] font-black text-orange-600 hover:text-slate-900 uppercase tracking-tighter transition-colors"
                >
                  ¿Recuperar clave?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-slate-200 transition-all transform active:scale-[0.97] disabled:bg-slate-300 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] mt-8 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verificando...
                </>
              ) : (
                <>
                  Entrar al Sistema
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* REGISTRO / FOOTER */}
          <div className="mt-12 pt-10 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              ¿Eres nuevo en la corporación?
            </p>
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all group"
            >
              <UserPlus size={16} className="group-hover:rotate-12 transition-transform" />
              Crear nueva cuenta
            </Link>

            <div className="mt-10 flex items-center justify-center gap-2 opacity-30 group">
                <span className="w-8 h-[1px] bg-slate-900" />
                <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">
                  KEMAK v4.0.26
                </p>
                <span className="w-8 h-[1px] bg-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}