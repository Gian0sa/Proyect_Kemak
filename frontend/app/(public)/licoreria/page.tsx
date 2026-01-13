'use client';
import { useEffect, useState } from 'react';
import { licoreriaService, ProductoLicoreriaDTO } from '@/services';
import { Beer, Wine, GlassWater, ChevronRight, Star, Info } from 'lucide-react';

export default function UserLicoreriaPage() {
  const [productos, setProductos] = useState<ProductoLicoreriaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await licoreriaService.getAll();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar licorería", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* SECCIÓN HERO LICORERÍA */}
      <div className="bg-white border-b border-slate-100 py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Star size={14} fill="currentColor" /> Selección Premium
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Tienda de <br /> <span className="text-orange-600">Licores & Bebidas</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto text-sm md:text-base mt-6">
            Explora nuestra cava exclusiva. Desde los clásicos más vendidos hasta ediciones limitadas, listos para tu celebración.
          </p>
        </div>
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
           <Wine size={300} />
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white h-80 rounded-[2.5rem] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productos.map((p) => (
              <div key={p.idProducto} className="group bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 hover:-translate-y-2">
                
                {/* IMAGEN DEL LICOR */}
                <div className="h-56 bg-slate-50 rounded-[2rem] flex items-center justify-center p-6 relative overflow-hidden">
                  {p.imagenes && p.imagenes.length > 0 ? (
                    <img 
                      src={p.imagenes[0].url} 
                      className="h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110" 
                      alt={p.nombre} 
                    />
                  ) : (
                    <GlassWater className="text-slate-200" size={60} />
                  )}
                </div>

                {/* DETALLES */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 font-black text-[9px] uppercase tracking-widest">{p.categoria}</span>
                    <div className="flex items-center gap-1 text-slate-300 group-hover:text-amber-400 transition-colors">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">4.9</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-tight h-12 line-clamp-2">
                    {p.nombre}
                  </h3>


                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Precio de Venta</p>
                      <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                        S/ {p.precio.toFixed(2)}
                      </p>
                    </div>
                    <button className="bg-orange-600 text-white p-3 rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-90 shadow-orange-200">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}