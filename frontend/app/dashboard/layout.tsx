'use client';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Menu, X, LogOut, LayoutDashboard, Wine, 
  Package, Tent, ShoppingCart, BarChart3, Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:white font-black italic uppercase tracking-tighter">
      Sincronizando Kemak ERP...
    </div>
  );

  // SECCIONES DEL MENÚ ORGANIZADAS POR LÓGICA DE NEGOCIO
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18}/> },
    { name: 'Caja / Vender', path: '/dashboard/ventas', icon: <ShoppingCart size={18}/>, color: 'text-orange-500' },
    { name: 'Historial Ventas', path: '/dashboard/reportes', icon: <BarChart3 size={18}/>, color: 'text-green-500' },
    { name: 'Licorería', path: '/dashboard/licoreria', icon: <Wine size={18}/> },
    { name: 'Mayorista', path: '/dashboard/mayorista', icon: <Package size={18}/> },
    { name: 'Toldos', path: '/dashboard/toldos', icon: <Tent size={18}/> },
    { name: 'Galería Media', path: '/dashboard/imagenes', icon: <ImageIcon size={18}/> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* 1. OVERLAY MÓVIL */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-md transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 2. SIDEBAR PROFESIONAL */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 dark:bg-black text-white flex flex-col transition-transform duration-500 ease-in-out border-r border-white/5
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:flex
      `}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter italic leading-none">KEMAK</span>
            <span className="text-[10px] font-bold text-blue-500 tracking-[0.3em] uppercase">Enterprise ERP</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Navegación Principal</p>
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group
                hover:bg-white/5 hover:translate-x-1
                font-black text-[11px] uppercase tracking-widest
                ${item.color || 'text-slate-400 hover:text-white'}
              `}
            >
              <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors shadow-lg">
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">Usuario Activo</p>
                <p className="text-xs font-bold truncate tracking-tight">{user?.username}</p>
            </div>
            <button 
                onClick={logout}
                className="w-full p-4 flex items-center justify-center gap-2 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-red-600 shadow-lg shadow-red-500/20"
            >
                <LogOut size={16} /> Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative bg-[url('/grid.svg')] bg-center bg-fixed">
        <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen">
          
          {/* HEADER HEADER */}
          <header className="mb-10 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-gray-800 transition-all">
            <div className="flex items-center gap-5">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 bg-slate-100 dark:bg-gray-800 rounded-2xl text-slate-600 dark:text-gray-300 shadow-inner">
                <Menu size={24} />
              </button>
              
              <div className="space-y-1">
                <h1 className="text-lg md:text-2xl font-black text-slate-900 dark:text-gray-100 tracking-tighter flex items-center gap-2 leading-none">
                  <span className="text-blue-600">●</span> Hola, {user?.username}
                </h1>
                <p className="hidden xs:block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Acceso de {user?.roles || 'Usuario'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden lg:flex flex-col items-end mr-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Servidor</span>
                 <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Operativo
                 </span>
              </div>
              <ThemeToggle />
              <div className="bg-blue-600/10 text-blue-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                {user?.roles}
              </div>
            </div>
          </header>

          {/* ÁREA DE CONTENIDO DINÁMICO */}
          <section className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}