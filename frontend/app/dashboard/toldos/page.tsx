'use client';
import { useEffect, useState, useRef } from 'react';
import { toldoService, imagenService, ToldoDTO, ToldoCreateDTO } from '@/services';
import { 
  Plus, Search, Edit, Trash2, Eye, X, Upload, 
  Loader2, Tent, Calendar, ChevronRight, ChevronLeft,
  Info, LayoutGrid, Ruler, CheckCircle2
} from 'lucide-react';

export default function ToldosPage() {
  const [toldos, setToldos] = useState<ToldoDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toldoPreview, setToldoPreview] = useState<ToldoDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<ToldoCreateDTO>({
    modelo: '', descripcion: '', precioAlquiler: 0
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarToldos(); }, []);

  const cargarToldos = async () => {
    try {
      setLoading(true);
      const data = await toldoService.getAll();
      setToldos(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const prepararEdicion = (t: ToldoDTO) => {
    setIdEditando(t.idToldo);
    setForm({ modelo: t.modelo, descripcion: t.descripcion || '', precioAlquiler: t.precioAlquiler });
    setPreviewUrl(t.imagenes?.length ? t.imagenes[0].url : null);
    setIsModalOpen(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let result;
      if (idEditando) result = await toldoService.update(idEditando, form);
      else result = await toldoService.create(form);

      if (archivo && (result?.idToldo || idEditando)) {
        const fd = new FormData();
        fd.append('Archivo', archivo);
        fd.append('TipoEntidad', 'TOLDO'); 
        fd.append('IdEntidad', (idEditando || result.idToldo).toString());
        fd.append('Descripcion', `Modelo ${form.modelo}`);
        await imagenService.upload(fd);
      }
      setIsModalOpen(false);
      resetForm();
      await cargarToldos();
    } catch (error) { alert("Error al guardar estructura"); } finally { setIsSaving(false); }
  };

  const resetForm = () => {
    setForm({ modelo: '', descripcion: '', precioAlquiler: 0 });
    setArchivo(null);
    setPreviewUrl(null);
    setIdEditando(null);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Retirar esta estructura del catálogo?")) {
      try {
        await toldoService.delete(id);
        await cargarToldos();
      } catch (error) { alert("Error al eliminar"); }
    }
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const filtrados = toldos.filter(t =>
    t.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
            Módulo <span className="text-blue-600">Eventos</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Tent size={12}/> Alquiler de Estructuras y Toldos
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="group bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 shadow-xl uppercase text-xs tracking-widest"
        >
          <Plus size={20} strokeWidth={3} /> Nuevo Modelo
        </button>
      </div>

      {/* 2. BUSCADOR PREMIUM */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.2rem] blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-2 shadow-sm">
           <Search className="ml-6 text-slate-300" size={22} />
           <input 
             type="text" 
             placeholder="Buscar por modelo de estructura..." 
             className="w-full px-4 py-4 bg-transparent outline-none font-bold text-sm dark:text-white placeholder:text-slate-300"
             value={busqueda}
             onChange={(e) => setBusqueda(e.target.value)}
           />
           <div className="hidden sm:flex items-center gap-2 mr-4 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl border dark:border-slate-800">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{filtrados.length}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Modelos</span>
           </div>
        </div>
      </div>

      {/* 3. GRID DE TOLDOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-[2.5rem]" />
          ))
        ) : filtrados.map((t) => (
          <div key={t.idToldo} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative">
            
            {/* Action Bar Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
               <button onClick={() => prepararEdicion(t)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-xl rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all"><Edit size={16}/></button>
               <button onClick={() => handleEliminar(t.idToldo)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-xl rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
            </div>

            {/* Visual Area */}
            <div className="h-56 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-0 relative overflow-hidden">
               {t.imagenes?.length ? (
                 <img src={t.imagenes[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="toldo" />
               ) : (
                 <Tent size={48} className="text-slate-200 dark:text-slate-700" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <button onClick={() => setToldoPreview(t)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Eye size={14}/> Ver Detalles
                  </button>
               </div>
               {(t.imagenes?.length ?? 0) > 1 && (
                 <span className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur text-white text-[9px] font-black px-3 py-1 rounded-lg border border-white/20">+{t.imagenes!.length} FOTOS</span>
               )}
            </div>

            {/* Info Area */}
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight italic line-clamp-1">{t.modelo}</h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/50">#TD-{t.idToldo}</span>
               </div>
               <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mb-6 uppercase leading-relaxed">{t.descripcion || 'Estructura modular resistente'}</p>
               
               <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Inversión x Día</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">S/ {t.precioAlquiler.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Disponible</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODAL REGISTRO/EDICIÓN - LOGISTICS STYLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none"><Tent size={24}/></div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Inventariar Estructura</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={28}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-10 grid grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="col-span-2 group relative h-60 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-blue-500 overflow-hidden shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargar Galería Visual</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Modelo / Referencia</label>
                <input required placeholder="Ej: Toldo Árabe 10x10" className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold dark:text-white uppercase" 
                  value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Especificaciones Técnicas / Descripción</label>
                <textarea rows={3} placeholder="Material, dimensiones, capacidad..." className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold dark:text-white text-xs uppercase" 
                  value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Tarifa Diaria de Alquiler (S/)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-blue-400 italic">S/</span>
                  <input type="number" step="0.01" required className="w-full bg-blue-50 dark:bg-blue-900/10 border-none pl-12 pr-5 py-5 rounded-2xl outline-none focus:ring-4 ring-blue-500/20 text-3xl font-black text-blue-600 italic tracking-tighter" 
                    value={form.precioAlquiler} onChange={e => setForm({...form, precioAlquiler: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] uppercase text-xs tracking-[0.3em] transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <Calendar size={20}/>
                    {idEditando ? "Sincronizar Disponibilidad" : "Habilitar para Alquiler"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. PREVIEW MODAL - BOOKING STYLE CATÁLOGO */}
      {toldoPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setToldoPreview(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500">
             
             {/* Galería Lateral Interactiva */}
             <div className="lg:col-span-3 bg-black relative group/gallery h-[400px] lg:h-full">
                <div 
                  ref={scrollRef}
                  className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                >
                  {toldoPreview.imagenes?.length ? toldoPreview.imagenes.map((img, i) => (
                    <img key={i} src={img.url} className="w-full h-full object-cover snap-center flex-shrink-0" alt="toldo" />
                  )) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-slate-100 font-black text-[12px] uppercase gap-4 italic opacity-40">
                      <Tent size={120} />
                      <p>Galería No disponible</p>
                    </div>
                  )}
                </div>
                {(toldoPreview.imagenes?.length ?? 0) > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                    <button onClick={() => scrollGallery('left')} className="p-4 bg-white/20 hover:bg-white/90 hover:text-black text-white rounded-full backdrop-blur-md transition-all shadow-2xl"><ChevronLeft size={24}/></button>
                    <button onClick={() => scrollGallery('right')} className="p-4 bg-white/20 hover:bg-white/90 hover:text-black text-white rounded-full backdrop-blur-md transition-all shadow-2xl"><ChevronRight size={24}/></button>
                  </div>
                )}
             </div>

             {/* Detalles en el Modal */}
             <div className="lg:col-span-2 p-10 lg:p-14 flex flex-col justify-center space-y-8 relative bg-white dark:bg-slate-900">
                <button onClick={() => setToldoPreview(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={32}/></button>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-600 h-1 w-8 rounded-full" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Stock de Alquiler</span>
                   </div>
                   <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase leading-none italic tracking-tighter">{toldoPreview.modelo}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Tarifa de Servicio</p>
                      <p className="text-3xl font-black text-blue-600 italic leading-none tracking-tighter">S/ {toldoPreview.precioAlquiler.toFixed(2)}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 inline-block">Monto diario neto</span>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border dark:border-slate-800 flex flex-col justify-center items-center text-center">
                      <LayoutGrid size={24} className="text-slate-300 mb-1" />
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-tight italic">Estructura Certificada</p>
                   </div>
                </div>

                <div className="p-6 border-l-4 border-blue-600 bg-blue-500/5 rounded-r-3xl">
                   <div className="flex items-center gap-2 mb-1">
                      <Info size={14} className="text-blue-600"/>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">Memoria de Calidad:</p>
                   </div>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase italic">
                      {toldoPreview.descripcion || 'Estructura modular de alta resistencia, diseñada para eventos corporativos y sociales de gran escala.'}
                   </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y dark:border-slate-800 py-6">
                   <div className="text-center"><Ruler size={16} className="mx-auto text-slate-300 mb-1"/><p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Modular</p></div>
                   <div className="text-center border-x dark:border-slate-800 px-2"><Tent size={16} className="mx-auto text-slate-300 mb-1"/><p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Impermeable</p></div>
                   <div className="text-center"><Calendar size={16} className="mx-auto text-slate-300 mb-1"/><p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Habilitado</p></div>
                </div>

                <button onClick={() => setToldoPreview(null)} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-3 transition-all hover:bg-blue-600 hover:shadow-2xl shadow-blue-500/20 active:scale-95 shadow-xl">
                   Cerrar Catálogo <ChevronRight size={18}/>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}