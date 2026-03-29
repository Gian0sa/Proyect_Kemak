'use client';
import { useRouter, usePathname } from 'next/navigation';
import { 
  UserCircle2, ChevronDown, Sun, Moon, Menu, X, LogIn, LayoutDashboard, LogOut 
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Estado para el dropdown
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ROLES QUE TIENEN PERMISO AL DASHBOARD
  const ROLES_ADMIN = ['Admin', 'Vendedor_Licoreria', 'Vendedor_Mayorista', 'Vendedor_Toldos'];
  const esAdmin = user?.roles?.some(role => ROLES_ADMIN.includes(role));

  // Cerrar el dropdown al hacer clic fuera
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
    { name: 'Distribución Mayorista', path: '/mayorista' },
    { name: 'Tienda Licorería', path: '/licoreria' },
    { name: 'Servicio de Toldos', path: '/toldos' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-[#121212] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        darkMode ? 'bg-[#1a1a1a]/95 border-white/5 shadow-2xl' : 'bg-[#F97316] border-orange-600 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex justify-between items-center">
          
          {/* LOGO KEMAK */}
          <Link href="/" className="flex items-center gap-3 md:gap-5 group">
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-white p-1 md:p-1.5 shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img src="/img/logo_kemak.jpg" alt="Kemak" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">KEMAK</h1>
              <span className="hidden md:block text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">Corporación</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-5">
            {/* SELECTOR DE ÁREA (Desktop) */}
            <div className="relative hidden md:block">
              <select 
                value={pathname}
                onChange={(e) => router.push(e.target.value)}
                className={`appearance-none font-bold py-2.5 pl-5 pr-12 rounded-xl border outline-none text-xs uppercase tracking-widest transition-all ${
                  darkMode ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-orange-600 border-white hover:bg-orange-50'
                }`}
              >
                {areas.map((area) => (
                  <option key={area.path} value={area.path}>{area.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" size={16} />
            </div>

            {/* TOGGLE DARK MODE */}
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 md:p-3 rounded-xl border transition-all ${darkMode ? 'bg-zinc-800 text-orange-400' : 'bg-white/20 text-white'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* BOTÓN DINÁMICO CON DROPDOWN */}
            {!isLoading && (
              user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`hidden md:flex items-center gap-3 px-5 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-tight transition-all shadow-xl border-2 ${
                      darkMode ? 'bg-zinc-800 text-white border-zinc-700 hover:border-orange-500' : 'bg-white text-orange-600 border-white hover:bg-orange-50'
                    }`}
                  >
                    <div className="bg-orange-500 text-white p-1 rounded-lg">
                      <UserCircle2 size={18} />
                    </div>
                    <span>{user.username}</span>
                    <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* MENÚ DESPLEGABLE */}
                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border p-2 animate-in fade-in zoom-in-95 duration-200 z-[70] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
                    }`}>
                      {/* SOLO SI ES ADMIN APARECE ESTA OPCIÓN */}
                      {esAdmin && (
                        <Link 
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                            darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <LayoutDashboard size={16} className="text-blue-500" />
                          Ir al Dashboard
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className={`hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-tight transition-all shadow-xl border-2 ${darkMode ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 text-white border-slate-800'}`}>
                  <LogIn size={18} />
                  <span>Acceder</span>
                </Link>
              )
            )}

            {/* BOTÓN MÓVIL */}
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-white bg-white/10 rounded-xl"><Menu size={28} /></button>
          </div>
        </div>

        {/* --- SIDEBAR MÓVIL --- */}
        <div className={`fixed inset-0 z-[60] transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 md:hidden`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <nav className={`absolute right-0 top-0 h-full w-4/5 max-w-xs flex flex-col p-6 transition-colors ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-10">
               <span className={`font-black italic uppercase text-xl ${darkMode ? 'text-white' : 'text-orange-600'}`}>Kemak Menu</span>
               <button onClick={() => setIsMenuOpen(false)}><X size={32} className={darkMode ? 'text-slate-400' : 'text-slate-600'}/></button>
            </div>

            {user && (
              <div className={`mb-8 p-4 rounded-2xl border-2 border-dashed ${darkMode ? 'border-orange-500/30 bg-orange-500/5' : 'border-orange-100 bg-orange-50'}`}>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Usuario Activo</p>
                <p className={`font-black uppercase text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user.username}</p>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="mt-3 flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase"><LogOut size={14}/> Salir</button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {areas.map((area) => (
                <Link key={area.path} href={area.path} onClick={() => setIsMenuOpen(false)} className={`p-4 rounded-2xl font-bold ${pathname === area.path ? 'bg-orange-600 text-white' : 'bg-slate-50 text-slate-700'}`}>{area.name}</Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t flex flex-col gap-4">
              {user && esAdmin && (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg"><LayoutDashboard size={20} /> Dashboard</Link>
              )}
              {!user && (
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 w-full bg-[#F97316] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg"><LogIn size={20} /> Login</Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className={`py-12 border-t text-center ${darkMode ? 'bg-[#0a0a0a] border-white/5 text-zinc-600' : 'bg-white text-slate-400'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">© 2026 KEMAK CORPORACIÓN</p>
      </footer>
    </div>
  );
}