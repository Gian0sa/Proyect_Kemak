'use client';
import { useState } from 'react';
import { authService } from '@/services';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);
    setError('');

    try {
      await authService.registrar({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setIsSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data || 'Error al intentar registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
        {/* Fondo decorativo en éxito */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-100 rounded-full blur-[120px] opacity-60" />
        </div>
        
        <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-12 text-center shadow-2xl shadow-green-100 border border-white animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6 text-green-500">
            <div className="p-5 bg-green-50 rounded-full animate-bounce">
              <CheckCircle2 size={60} strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">¡Registro Exitoso!</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">
            Tu cuenta en Kemak ha sido creada. <br/> Preparando tu acceso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden font-sans">
      
      {/* FONDO DINÁMICO (Mismo que Login) */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* BOTÓN VOLVER */}
      <Link 
        href="/auth/login" 
        className="absolute top-10 left-10 z-20 flex items-center gap-3 text-slate-400 hover:text-orange-600 transition-all group"
      >
        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-orange-200 group-hover:shadow-lg transition-all border border-slate-100">
          <ArrowLeft size={18} />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden md:block">Ir al Login</span>
      </Link>

      <div className="relative z-10 max-w-xl w-full">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl shadow-slate-200/50 p-10 md:p-14 border border-white">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-lg shadow-slate-200">
               <ShieldCheck size={14} className="text-orange-500" /> Nuevo Registro
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter italic uppercase leading-none">
              Únete a <span className="text-orange-600">Kemak</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-4">
              Crea tu perfil de acceso corporativo
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 rounded-2xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 animate-shake">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="group space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-orange-600 transition-colors">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Ej: gian2026"
                  className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="group space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-orange-600 transition-colors">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-orange-600 transition-colors">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800 text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-orange-600 transition-colors">Confirmar</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800 text-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-slate-200 transition-all transform active:scale-[0.97] disabled:bg-slate-300 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creando Perfil...
                  </>
                ) : (
                  <>
                    Completar Registro
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
              Al registrarte aceptas las políticas de seguridad <br/> y términos de servicio de Corporación Kemak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}