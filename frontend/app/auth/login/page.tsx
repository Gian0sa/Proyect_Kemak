'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/services';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();

  // EFECTO DE SINCRONIZACIÓN GOOGLE -> KEMAK Context
  useEffect(() => {
    // Si la sesión de Google está activa
    if (status === 'authenticated' && session?.user) {
      
      // Verificamos si ya tenemos los datos en localStorage
      // Esto evita que el loop se ejecute si ya estamos dentro
      const currentAuth = localStorage.getItem('auth');
      
      if (!currentAuth) {
        const sessionUser = session.user as any;
        const dataParaContext = {
          token: sessionUser.token,
          roles: sessionUser.roles || [],
          username: sessionUser.name || '',
          email: sessionUser.email || '',
        };

        localStorage.setItem('auth', JSON.stringify(dataParaContext));
        login(dataParaContext);

        const isAdmin = dataParaContext.roles?.some((role: string) => 
          role.toLowerCase() === 'admin'
        );
        router.push(isAdmin ? '/dashboard' : '/');
      }
    }
  }, [status, session, login, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password }); 
      login(data);
      const isAdmin = data.roles.some(role => role.toLowerCase() === 'admin');
      router.push(isAdmin ? '/dashboard' : '/'); 
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />
      </div>

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
          
          <div className="text-center mb-10">
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
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 rounded-2xl text-xs font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="ejemplo@kemak.com"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-6 rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar al Sistema"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[9px] uppercase font-black"><span className="bg-white px-4 text-slate-300 tracking-[0.3em]">O entrar con</span></div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50/30 py-4 rounded-[1.8rem] transition-all group active:scale-[0.98]"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest group-hover:text-orange-600">Google Account</span>
          </button>

          <div className="mt-10 text-center border-t border-slate-100 pt-8">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all group"
            >
              <UserPlus size={16} /> Crear nueva cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}