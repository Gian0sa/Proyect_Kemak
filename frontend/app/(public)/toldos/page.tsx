'use client';
import { useEffect, useState } from 'react';
import { toldoService, ToldoDTO } from '@/services';
import { Tent, ChevronRight, ChevronLeft, Calendar, Users, Expand } from 'lucide-react';

export default function UserToldosPage() {
  const [toldos, setToldos] = useState<ToldoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await toldoService.getAll();
        setToldos(data);
      } catch (error) {
        console.error("Error al cargar catálogo de toldos", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* SECCIÓN HERO TOLDOS */}
      <div className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
             Estructuras para Eventos de Gala
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Alquiler de <br /> <span className="text-orange-600">Toldos & Estructuras</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto text-sm md:text-base mt-6">
            Creamos el ambiente perfecto para tu evento. Contamos con estructuras de diversos tamaños, materiales de alta calidad y diseños exclusivos para bodas, ferias y eventos corporativos.
          </p>
        </div>
      </div>

      {/* GRILLA DE TOLDOS */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map((item, idx) => (
              <div key={`sk-toldo-${idx}`} className="bg-white h-[450px] rounded-[2.5rem] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {toldos.map((t) => (
              <ToldoCard key={t.idToldo} toldo={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-componente para manejar el carrusel interno de cada toldo
function ToldoCard({ toldo }: { toldo: ToldoDTO }) {
  const [imgIndex, setImgIndex] = useState(0);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toldo.imagenes && toldo.imagenes.length > 0) {
      setImgIndex((prev) => (prev + 1) % toldo.imagenes!.length);
    }
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toldo.imagenes && toldo.imagenes.length > 0) {
      setImgIndex((prev) => (prev - 1 + toldo.imagenes!.length) % toldo.imagenes!.length);
    }
  };

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 hover:-translate-y-2">
      
      {/* CONTENEDOR DE IMAGEN CON CARRUSEL */}
      <div className="h-80 bg-slate-100 relative overflow-hidden">
        {toldo.imagenes && toldo.imagenes.length > 0 ? (
          <>
            <img 
              src={toldo.imagenes[imgIndex].url} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={toldo.modelo} 
            />
            {/* Controles del carrusel si hay más de una imagen */}
            {toldo.imagenes.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevImg} className="bg-white/80 p-2 rounded-full text-slate-900 hover:bg-orange-600 hover:text-white transition-all shadow-lg">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImg} className="bg-white/80 p-2 rounded-full text-slate-900 hover:bg-orange-600 hover:text-white transition-all shadow-lg">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            {/* Indicadores de posición */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {toldo.imagenes.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'w-6 bg-orange-600' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 font-black uppercase text-xs">
            <Tent size={60} /> Sin imágenes disponibles
          </div>
        )}
      </div>

      {/* CONTENIDO DEL TOLDO */}
      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {toldo.modelo}
            </h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
              {toldo.descripcion || 'Estructura modular reforzada para todo tipo de clima.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-green-500 bg-green-50 px-3 py-1 rounded-full">
            <Calendar size={12} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Disponible</span>
          </div>
        </div>

        <div className="flex gap-4 py-4 border-y border-slate-50">
           <div className="flex items-center gap-2 text-slate-500">
              <Expand size={16} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-tighter">Área Variable</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-tighter">Alta Capacidad</span>
           </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Inversión Alquiler x Día</p>
            <p className="text-4xl font-black text-orange-600 italic tracking-tighter">
              S/ {toldo.precioAlquiler.toFixed(2)}
            </p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all active:scale-95 shadow-orange-100">
            Consultar Disponibilidad
          </button>
        </div>
      </div>
    </div>
  );
}