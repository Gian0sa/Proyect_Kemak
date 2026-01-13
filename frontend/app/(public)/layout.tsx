'use client';
import { useRouter, usePathname } from 'next/navigation';
import { UserCircle2, ChevronDown, Sun, Moon, Menu, X, LogIn } from 'lucide-react'; 
import { useState } from 'react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil

  const areas = [
    { name: 'Distribución Mayorista', path: '/mayorista' },
    { name: 'Tienda Licorería', path: '/licoreria' },
    { name: 'Servicio de Toldos', path: '/toldos' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-[#121212] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* HEADER DINÁMICO */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        darkMode 
          ? 'bg-[#1a1a1a]/95 border-white/5 shadow-2xl' 
          : 'bg-[#F97316] border-orange-600 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex justify-between items-center">
          
          {/* LOGO KEMAK */}
          <Link href="/" className="flex items-center gap-3 md:gap-5 group">
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-white p-1 md:p-1.5 shadow-xl group-hover:scale-105 transition-transform duration-300">
               <img 
                src="/img/logo_kemak.jpg" 
                alt="Kemak" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">
                KEMAK
              </h1>
              <span className="hidden md:block text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">
                Corporación
              </span>
            </div>
          </Link>

          {/* BOTONES LADO DERECHO */}
          <div className="flex items-center gap-2 md:gap-5">
            
            {/* SELECTOR DE ÁREA (Solo Laptop/Tablet) */}
            <div className="relative hidden md:block">
              <select 
                value={pathname}
                onChange={(e) => router.push(e.target.value)}
                className={`appearance-none font-bold py-2.5 pl-5 pr-12 rounded-xl border outline-none cursor-pointer text-xs uppercase tracking-widest transition-all ${
                  darkMode 
                    ? 'bg-zinc-800 text-white border-zinc-700' 
                    : 'bg-white text-orange-600 border-white hover:bg-orange-50'
                }`}
              >
                {areas.map((area) => (
                  <option key={area.path} value={area.path} className="text-slate-800">{area.name}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                darkMode ? 'text-orange-500' : 'text-orange-600'
              }`} size={16} />
            </div>

            {/* TOGGLE DARK MODE (Siempre visible) */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 md:p-3 rounded-xl border transition-all active:scale-90 ${
                darkMode ? 'bg-zinc-800 border-zinc-700 text-orange-400' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* BOTÓN LOGIN (Solo Laptop) */}
            <Link 
              href="/auth/login"
              className={`hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-tight transition-all shadow-xl active:scale-95 border-2 ${
                darkMode 
                  ? 'bg-orange-600 text-white border-orange-500 hover:bg-orange-700' 
                  : 'bg-slate-900 text-white border-slate-800 hover:bg-black'
              }`}
            >
              <LogIn size={18} />
              <span>Login / Register</span>
            </Link>

            {/* BOTÓN MENÚ HAMBURGUESA (Solo Móvil) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 text-white bg-white/10 rounded-xl active:scale-95 transition-all"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* --- MENÚ LATERAL MÓVIL (SIDEBAR) --- */}
        <div className={`fixed inset-0 z-[60] transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 md:hidden`}>
          {/* Overlay oscuro de fondo */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          
          {/* Contenido del Menú */}
          <nav className={`absolute right-0 top-0 h-full w-4/5 max-w-xs shadow-2xl flex flex-col p-6 transition-colors duration-500 ${
            darkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-10">
               <span className={`font-black italic uppercase tracking-tighter text-xl ${darkMode ? 'text-white' : 'text-orange-600'}`}>Kemak Menu</span>
               <button onClick={() => setIsMenuOpen(false)} className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                 <X size={32} />
               </button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secciones</p>
              {areas.map((area) => (
                <Link 
                  key={area.path} 
                  href={area.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                    pathname === area.path 
                    ? (darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600')
                    : (darkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-700')
                  }`}
                >
                  {area.name}
                  <ChevronDown className="-rotate-90 opacity-50" size={16} />
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
              <Link 
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full bg-[#F97316] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95"
              >
                <LogIn size={20} />
                Login / Register
              </Link>
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Kemak Corporación</p>
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className={`py-12 border-t text-center ${
        darkMode ? 'bg-[#0a0a0a] border-white/5 text-zinc-600' : 'bg-white border-slate-200 text-slate-400'
      }`}>
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
          © 2026 KEMAK CORPORACIÓN · Calidad y Confianza
        </p>
      </footer>
    </div>
  );
}