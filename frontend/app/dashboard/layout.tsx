'use client';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Wine, Package, Tent } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Control del menú móvil

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
      Cargando sistema...
    </div>
  );

  const menuItems = [
    { name: 'Inicio', path: '/dashboard', icon: <LayoutDashboard size={18}/> },
    { name: 'Licorería', path: '/dashboard/licoreria', icon: <Wine size={18}/>, color: 'text-blue-400' },
    { name: 'Mayorista', path: '/dashboard/mayorista', icon: <Package size={18}/> },
    { name: 'Toldos', path: '/dashboard/toldos', icon: <Tent size={18}/> },
    { name: 'Imagenes', path: '/dashboard/imagenes', icon: <Tent size={18}/> },
    { name: 'Ventas', path: '/dashboard/ventas', icon: <Tent size={18}/> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      
      {/* 1. OVERLAY PARA MÓVIL (Cierra el menú al tocar fuera) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR RESPONSIVE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 dark:bg-black text-white flex flex-col transition-transform duration-300 border-r dark:border-gray-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:flex
      `}>
        <div className="p-6 text-2xl font-black border-b border-slate-800 dark:border-gray-900 tracking-tighter italic flex justify-between items-center">
          <span>KEMAK <span className="text-blue-500">ERP</span></span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 p-3 hover:bg-slate-800 dark:hover:bg-gray-900 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest ${item.color || ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 dark:border-gray-900">
          <button 
            onClick={logout}
            className="w-full p-4 flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          {/* HEADER RESPONSIVE */}
          <header className="mb-6 md:mb-8 flex justify-between items-center bg-white dark:bg-gray-900 p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-4">
              {/* Botón Hamburguesa para abrir menú */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <Menu size={24} />
              </button>
              
              <div className="space-y-0.5">
                <h1 className="text-base md:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight line-clamp-1">
                  Hola, {user?.username}
                </h1>
                <p className="hidden xs:block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Panel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <div className="hidden sm:block h-8 w-[1px] bg-gray-100 dark:bg-gray-800 mx-1" />
              <span className="hidden sm:inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                {user?.roles}
              </span>
            </div>
          </header>

          {/* CONTENIDO DE PÁGINAS */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}