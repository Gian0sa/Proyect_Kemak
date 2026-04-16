'use client';
import { useEffect, useState } from 'react';
import { licoreriaService, ProductoLicoreriaDTO } from '@/services';
import { 
  Wine, GlassWater, ChevronRight, Star, Package, 
  MessageCircle, Zap, ShieldCheck, Truck, ShoppingCart,
  ArrowUpRight, Filter, Info
} from 'lucide-react';

export default function UserLicoreriaPage() {
  const [productos, setProductos] = useState<ProductoLicoreriaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await licoreriaService.getAll();
        setProductos(data);
      } catch (error) {
        console.error("Error catálogo licorería:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleWhatsAppOrder = (producto: ProductoLicoreriaDTO) => {
    const message = `¡Hola Kemak! 🥂 Me interesa el ${producto.nombre} (${producto.marca}). ¿Tienen stock para delivery ahora mismo?`;
    window.open(`https://wa.me/51902488881?text=${encodeURIComponent(message)}`, '_blank');
  };

  const categorias = ['TODOS', ...new Set(productos.map(p => p.categoria.toUpperCase()))];
  const productosFiltrados = filtro === 'TODOS' 
    ? productos 
    : productos.filter(p => p.categoria.toUpperCase() === filtro);

  return (
    <div className="min-h-screen bg-[#FBFBFB] pb-20 font-sans text-slate-900">
      
      {/* --- LUXURY HERO SECTION --- */}
      <section className="relative bg-slate-950 py-24 px-6 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -ml-20 -mb-20" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Delivery Express 24/7</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
            The <span className="text-orange-500">Liquor</span> <br /> Collection
          </h1>
          
          <p className="text-slate-400 font-medium max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Una selección curada de destilados premium y cervezas artesanales. Calidad garantizada en cada botella para tus momentos más exclusivos.
          </p>

          <div className="flex flex-wrap justify-center gap-10 pt-10 border-t border-white/5 mt-12">
            <div className="flex flex-col items-center gap-2 group cursor-default">
               <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all text-orange-500">
                 <ShieldCheck size={24} />
               </div>
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">100% Original</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
               <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-500">
                 <Truck size={24} />
               </div>
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Envío Inmediato</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTROS DE CATEGORÍA --- */}
      <div className="sticky top-24 z-40 bg-[#FBFBFB]/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtro === cat 
                  ? 'bg-slate-900 text-white shadow-xl scale-105' 
                  : 'text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{productosFiltrados.length} Resultados</span>
          </div>
        </div>
      </div>

      {/* --- GRILLA DE PRODUCTOS PREMIUN --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-[450px] rounded-[3rem] animate-pulse border border-slate-100 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {productosFiltrados.map((p) => (
              <div key={p.idProducto} className="group relative bg-white rounded-[3.5rem] p-6 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-4 border border-transparent hover:border-slate-100">
                
                {/* ÁREA VISUAL (BOTELLA) */}
                <div className="relative h-[320px] bg-[#F3F4F6] rounded-[2.8rem] flex items-center justify-center p-10 overflow-hidden mb-8 group-hover:bg-white transition-colors duration-500">
                  {/* Badge de Categoría Float */}
                  <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">
                    {p.categoria}
                  </span>

                  {/* Stock Alert */}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-6 right-6 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase animate-pulse">
                      Últimas unidades
                    </span>
                  )}

                  {p.imagenes && p.imagenes.length > 0 ? (
                    <img 
                      src={p.imagenes[0].url} 
                      className="h-full w-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" 
                      alt={p.nombre} 
                    />
                  ) : (
                    <Wine className="text-slate-200" size={100} strokeWidth={1} />
                  )}

                  {/* Overlay Quick Info */}
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <button onClick={() => handleWhatsAppOrder(p)} className="bg-white p-4 rounded-full shadow-2xl hover:bg-orange-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                      <ShoppingCart size={24} />
                    </button>
                  </div>

                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-slate-900 text-white text-[11px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-2xl">Agotado</span>
                    </div>
                  )}
                </div>

                {/* INFO DEL PRODUCTO */}
                <div className="space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{p.marca}</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-black text-slate-400 tracking-tighter italic">Premium</span>
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none line-clamp-2 min-h-[60px]">
                        {p.nombre}
                      </h3>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                      <ArrowUpRight size={20} className="text-slate-300 group-hover:text-orange-500" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Precio sugerido</p>
                      <p className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none">
                        S/ {p.precio.toFixed(2)}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleWhatsAppOrder(p)}
                      disabled={p.stock === 0}
                      className={`flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                        p.stock === 0 
                        ? 'bg-slate-100 text-slate-300' 
                        : 'bg-slate-950 text-white hover:bg-green-600 shadow-slate-200'
                      }`}
                    >
                      <MessageCircle size={18} />
                      Ordenar Ahora
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECCIÓN DE INFOMACIÓN CORPORATIVA --- */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl"><Zap size={28}/></div>
              <h5 className="font-black uppercase tracking-tighter text-lg italic">Envío Flash</h5>
              <p className="text-xs font-medium text-slate-400 uppercase">Recibe tu pedido en menos de 45 minutos en zonas seleccionadas.</p>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><ShieldCheck size={28}/></div>
              <h5 className="font-black uppercase tracking-tighter text-lg italic">Certificación</h5>
              <p className="text-xs font-medium text-slate-400 uppercase">Todos nuestros licores cuentan con registro sanitario y procedencia original.</p>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><Info size={28}/></div>
              <h5 className="font-black uppercase tracking-tighter text-lg italic">Atención Personalizada</h5>
              <p className="text-xs font-medium text-slate-400 uppercase">¿No sabes qué elegir? Nuestros expertos te asesoran vía WhatsApp.</p>
           </div>
        </div>
      </div>
    </div>
  );
}