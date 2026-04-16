'use client';
import { useEffect, useState, useMemo } from 'react';
import { toldoService, ToldoDTO } from '@/services';
import { 
  Tent, ChevronRight, ChevronLeft, Calendar, 
  Users, Expand, MapPin, Sparkles, PhoneCall, ArrowRight,
  LayoutGrid, SlidersHorizontal
} from 'lucide-react';

export default function UserToldosPage() {
  const [toldos, setToldos] = useState<ToldoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 por fila, 2 filas por página

  useEffect(() => {
    const load = async () => {
      try {
        const data = await toldoService.getAll();
        setToldos(data);
      } catch (error) {
        console.error("Error catálogo:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Lógica de Paginación
  const totalPages = Math.ceil(toldos.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return toldos.slice(start, start + itemsPerPage);
  }, [toldos, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-[#fafafa]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl">
            <Sparkles size={12}/> Kemak Premium Events
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            Estructuras para <br /> <span className="text-orange-500">Momentos Únicos</span>
          </h1>
          <p className="text-slate-300 font-medium max-w-xl mx-auto text-sm mt-6 leading-relaxed">
            Infraestructura de alta gama para bodas, ferias y eventos masivos.
          </p>
        </div>
      </section>

      {/* --- GRILLA DE PRODUCTOS (3 COLUMNAS) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* Barra de estado de resultados */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 ml-4">
              <LayoutGrid size={18} className="text-orange-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Mostrando {currentItems.length} de {toldos.length} Modelos
              </span>
           </div>
           <div className="flex items-center gap-2 mr-2 text-slate-400">
              <SlidersHorizontal size={16} />
              <span className="text-[9px] font-black uppercase">Filtrar catálogo</span>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-[450px] rounded-[3rem] animate-pulse border border-slate-100 shadow-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((t) => (
                <ToldoUserCard key={t.idToldo} toldo={t} />
              ))}
            </div>

            {/* --- COMPONENTE DE PAGINACIÓN --- */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-orange-600 hover:shadow-lg transition-all disabled:opacity-20"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        currentPage === i + 1 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                        : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-orange-600 hover:shadow-lg transition-all disabled:opacity-20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- FOOTER CONTACTO --- */}
      <div className="max-w-4xl mx-auto mt-24 px-6 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 italic">Asesoría Directa</p>
         <h4 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-10">¿Buscas algo personalizado?</h4>
         <a href="https://wa.me/51987654321" className="inline-flex items-center gap-4 bg-slate-950 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-2xl">
            <PhoneCall size={20} /> Hablar con un especialista
         </a>
      </div>
    </div>
  );
}

function ToldoUserCard({ toldo }: { toldo: ToldoDTO }) {
  const [imgIndex, setImgIndex] = useState(0);

  return (
    <div className="group bg-white rounded-[2.8rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-50 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] hover:-translate-y-2">
      
      {/* ÁREA VISUAL COMPACTA */}
      <div className="h-[280px] relative bg-slate-100 overflow-hidden">
        {toldo.imagenes?.length ? (
          <>
            <img 
              src={toldo.imagenes[imgIndex].url} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              alt={toldo.modelo} 
            />
            {/* Overlay Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Badge Precio Flotante */}
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-xl italic">
               S/ {toldo.precioAlquiler.toFixed(2)} <span className="text-[7px] uppercase not-italic opacity-70 ml-0.5">/ día</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
            <Tent size={60} strokeWidth={1} />
            <span className="font-black uppercase text-[8px] tracking-widest">Sin vista previa</span>
          </div>
        )}
      </div>

      {/* ÁREA DE CONTENIDO REFINADA */}
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
             <div className="w-4 h-[2px] bg-orange-600" />
             <span className="text-[8px] font-black uppercase tracking-widest">Garantía Kemak</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none truncate">
            {toldo.modelo}
          </h3>
        </div>

        <p className="text-slate-400 font-medium text-[11px] leading-relaxed uppercase line-clamp-2 h-8">
          {toldo.descripcion || 'Infraestructura modular premium para eventos sociales.'}
        </p>

        {/* Specs Mini Grid */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50">
           <div className="flex flex-col items-center gap-1">
              <Expand className="text-slate-300" size={16} />
              <span className="text-[7px] font-black text-slate-400 uppercase">Modular</span>
           </div>
           <div className="flex flex-col items-center gap-1 border-x border-slate-50">
              <Users className="text-slate-300" size={16} />
              <span className="text-[7px] font-black text-slate-400 uppercase">Aforo</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-[7px] font-black text-slate-400 uppercase">Lista</span>
           </div>
        </div>

        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-orange-600 shadow-xl">
           Reservar <ArrowRight size={14}/>
        </button>
      </div>
    </div>
  );
}

// Icono extra faltante
function CheckCircle2({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}