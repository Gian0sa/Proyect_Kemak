'use client';
import { useRouter, usePathname } from 'next/navigation';
import { 
  UserCircle2, ChevronDown, Sun, Moon, Menu, X, LogIn, 
  LayoutDashboard, LogOut, ShoppingBag, Store, Tent, Sparkles
} from 'lucide-react'; 
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const ROLES_ADMIN = ['Admin', 'Vendedor_Licoreria', 'Vendedor_Mayorista', 'Vendedor_Toldos'];
  const esAdmin = user?.roles?.some(role => ROLES_ADMIN.includes(role));
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const areas = [
    { name: 'Mayorista', path: '/mayorista', icon: <Store size={14}/> },
    { name: 'Licorería', path: '/licoreria', icon: <ShoppingBag size={14}/> },
    { name: 'Toldos', path: '/toldos', icon: <Tent size={14}/> },
  ];

  const currentArea = areas.find(a => a.path === pathname) || areas[0];

  return (
    <div className={`min-h-screen transition-colors duration-700 ${
      darkMode ? 'bg-[#0a0a0a] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <header className={`sticky top-0 z-[60] transition-all duration-500 ${
        darkMode 
          ? 'bg-[#121212]/80 border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
          : 'bg-white/80 border-b border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
      } backdrop-blur-xl`}>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex justify-between items-center">
          
          {/* LOGO KEMAK CON EFECTO GLOW */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-white p-1.5 shadow-2xl border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                <img src="/img/logo_kemak.jpg" alt="Kemak" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent leading-none">KEMAK</h1>
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Corporación</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            
            {/* NAVEGACIÓN DE ÁREAS (Desktop) */}
            <nav className="hidden lg:flex items-center bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-slate-200/50 dark:border-white/5">
              {areas.map((area) => (
                <Link 
                  key={area.path} 
                  href={area.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    pathname === area.path 
                      ? 'bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-xl scale-105' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {area.icon}
                  {area.name}
                </Link>
              ))}
            </nav>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

            {/* TOGGLE DARK MODE */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-3 rounded-2xl border transition-all duration-500 ${
                darkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-orange-600'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* BOTÓN DINÁMICO */}
            {!isLoading && (
              user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`hidden md:flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                      darkMode ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                      <UserCircle2 size={24} />
                    </div>
                    <div className="flex flex-col items-start text-left leading-none">
                       <span className="mb-1 text-orange-500 text-[8px] font-black tracking-[0.2em]">Personal</span>
                       <span>{user.username}</span>
                    </div>
                    <ChevronDown size={14} className={`ml-2 transition-transform duration-500 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* DROP DOWN PREMIUM */}
                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-4 w-64 rounded-[2.5rem] shadow-2xl border p-4 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 z-[70] ${
                      darkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-slate-100'
                    }`}>
                      <div className="px-4 py-4 mb-3 border-b border-slate-50 dark:border-white/5">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">Cuenta Activa</p>
                        <p className={`text-xs font-black truncate ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        {esAdmin && (
                          <Link 
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                              darkMode ? 'hover:bg-white/5' : 'hover:bg-orange-50'
                            }`}
                          >
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                              <LayoutDashboard size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-black uppercase ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Panel Central</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Gestión de Negocio</span>
                            </div>
                          </Link>
                        )}

                        <button 
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                            darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                          }`}
                        >
                          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 group-hover:rotate-12 transition-transform">
                            <LogOut size={20} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase text-red-500">Cerrar Sesión</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Salir del Sistema</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="hidden md:flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all bg-slate-900 text-white hover:bg-orange-600 shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95">
                  <LogIn size={18} />
                  <span>Acceder</span>
                </Link>
              )
            )}

            {/* BOTÓN MÓVIL */}
            <button onClick={() => setIsMenuOpen(true)} className={`md:hidden p-3 rounded-2xl transition-colors ${darkMode ? 'text-white bg-white/5' : 'text-slate-900 bg-slate-100'}`}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <div className={`fixed inset-0 z-[100] transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-700 ease-out md:hidden`}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <nav className={`absolute right-0 top-0 h-full w-4/5 max-w-sm flex flex-col p-8 transition-colors shadow-2xl ${darkMode ? 'bg-[#0f0f0f]' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-12">
               <span className={`font-black italic uppercase text-2xl tracking-tighter ${darkMode ? 'text-orange-500' : 'text-orange-600'}`}>Menu.</span>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl"><X size={24}/></button>
            </div>

            {user && (
              <div className={`mb-10 p-6 rounded-[2.5rem] border-2 border-dashed ${darkMode ? 'border-orange-500/20 bg-orange-500/5' : 'border-orange-100 bg-orange-50'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <UserCircle2 size={28} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none mb-1">Identificado</p>
                    <p className={`font-black uppercase text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user.username}</p>
                  </div>
                </div>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase text-[9px] hover:bg-red-500 hover:text-white transition-all">
                  <LogOut size={14}/> Salir del Sistema
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-4">Nuestros Servicios</p>
              {areas.map((area) => (
                <Link 
                  key={area.path} 
                  href={area.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`flex items-center gap-4 p-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.1em] transition-all ${
                    pathname === area.path ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20 scale-105' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${pathname === area.path ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                    {area.icon}
                  </div>
                  {area.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t dark:border-white/5 flex flex-col gap-4">
              {user && esAdmin && (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl"><LayoutDashboard size={20} /> Ir al Dashboard</Link>
              )}
              {!user && (
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl"><LogIn size={20} /> Acceso Personal</Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 animate-in fade-in duration-1000">
        {children}
      </main>

      <footer className={`py-20 border-t relative overflow-hidden ${darkMode ? 'bg-[#050505] border-white/5 text-zinc-600' : 'bg-white text-slate-400'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-orange-600">KEMAK CORPORACIÓN</p>
              <p className="text-[9px] font-bold uppercase tracking-widest">Excelencia en Distribución & Eventos</p>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-[0.5em]">© 2026 TODOS LOS DERECHOS RESERVADOS</p>
        </div>
      </footer>
    </div>
  );
}