'use client';
import { useEffect, useState, useRef } from 'react';
import { toldoService, imagenService, ToldoDTO, ToldoCreateDTO } from '@/services';
import { Plus, Search, Edit, Trash2, Eye, X, Upload, Loader2, Tent, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ToldosPage() {
  // Estados de Datos Originales
  const [toldos, setToldos] = useState<ToldoDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Modales Originales
  const [toldoPreview, setToldoPreview] = useState<ToldoDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // Estados del Formulario Originales
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<ToldoCreateDTO>({
    modelo: '',
    descripcion: '',
    precioAlquiler: 0
  });

  // Referencia para controlar el scroll de la galería
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarToldos(); }, []);

  const cargarToldos = async () => {
    try {
      setLoading(true);
      const data = await toldoService.getAll();
      setToldos(data);
    } catch (error) {
      console.error("Error cargando toldos", error);
    } finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const prepararEdicion = (t: ToldoDTO) => {
    setIdEditando(t.idToldo);
    setForm({
      modelo: t.modelo,
      descripcion: t.descripcion || '',
      precioAlquiler: t.precioAlquiler
    });
    setPreviewUrl(t.imagenes && t.imagenes.length > 0 ? t.imagenes[0].url : null);
    setIsModalOpen(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let result;
      if (idEditando) {
        result = await toldoService.update(idEditando, form);
      } else {
        result = await toldoService.create(form);
      }

      if (archivo && (result?.idToldo || idEditando)) {
        const idFinal = idEditando || result.idToldo;
        const fd = new FormData();
        fd.append('Archivo', archivo);
        fd.append('TipoEntidad', 'TOLDO'); 
        fd.append('IdEntidad', idFinal.toString());
        fd.append('Descripcion', `Imagen de ${form.modelo}`);
        await imagenService.upload(fd);
      }

      setIsModalOpen(false);
      resetForm();
      await cargarToldos();
    } catch (error) {
      alert("Error al procesar el modelo de toldo");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ modelo: '', descripcion: '', precioAlquiler: 0 });
    setArchivo(null);
    setPreviewUrl(null);
    setIdEditando(null);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Eliminar esta estructura del catálogo?")) {
      try {
        await toldoService.delete(id);
        await cargarToldos();
      } catch (error) {
        alert("Error al eliminar");
      }
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
    <div className="space-y-6 pb-10">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-slate-100 uppercase italic tracking-tighter">Gestión de Toldos</h2>
          <p className="hidden xs:block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Catálogo de estructuras y eventos</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all active:scale-95 shadow-lg uppercase text-[10px]"
        >
          <Plus size={18} /> Nuevo Modelo
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar modelo o descripción..."
          className="w-full pl-12 pr-4 py-4 border rounded-xl bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-gray-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* VISTA PC: TABLA (Tu lógica original) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-5">Estructura / Galería</th>
              <th className="px-6 py-5">Descripción</th>
              <th className="px-6 py-5">Tarifa</th>
              <th className="px-6 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Cargando Almacén...</td></tr>
            ) : filtrados.map((t) => (
              <tr key={t.idToldo} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {t.imagenes?.length ? (
                      <img src={t.imagenes[0].url} className="w-full h-full object-cover rounded-lg border shadow-sm bg-white" alt="toldo" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center"><Tent size={24} className="text-gray-400" /></div>
                    )}
                  {(t.imagenes?.length ?? 0) > 1 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                  +{(t.imagenes?.length ?? 0) - 1}
                  </span>
                  )}
                  </div>
                  <div className="font-black text-gray-800 dark:text-slate-100 uppercase italic">
                    {t.modelo}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-500 text-[11px] max-w-xs truncate italic">{t.descripcion}</td>
                <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400 italic font-sans">S/ {t.precioAlquiler.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setToldoPreview(t)} className="text-gray-400 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
                    <button onClick={() => prepararEdicion(t)} className="text-gray-400 hover:text-amber-500 transition-colors"><Edit size={18}/></button>
                    <button onClick={() => handleEliminar(t.idToldo)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL: CARDS (Igual Estándar que Mayorista/Licorería) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center py-10 text-slate-400 font-black uppercase text-[10px]">Consultando Estructuras...</p>
        ) : filtrados.map((t) => (
          <div key={t.idToldo} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border dark:border-slate-700">
                {t.imagenes?.length ? (
                  <img src={t.imagenes[0].url} className="w-full h-full object-cover" alt={t.modelo} />
                ) : (
                  <Tent className="text-slate-300" size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-800 dark:text-white uppercase text-sm truncate italic">{t.modelo}</h3>
                <p className="text-[10px] text-blue-600 font-black italic">S/ {t.precioAlquiler.toFixed(2)} / día</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">Modelo #TD-{t.idToldo}</span>
              <div className="flex gap-2">
                <button onClick={() => setToldoPreview(t)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600"><Eye size={16}/></button>
                <button onClick={() => prepararEdicion(t)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-amber-500"><Edit size={16}/></button>
                <button onClick={() => handleEliminar(t.idToldo)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL REGISTRO/EDICIÓN ADAPTADO */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-black dark:text-white uppercase italic">{idEditando ? 'Actualizar Estructura' : 'Alta de Nuevo Modelo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 sm:p-10 grid grid-cols-2 gap-4 sm:gap-6 max-h-[80vh] overflow-y-auto">
              <div className="col-span-2 flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[32px] p-6 relative bg-gray-50/30 dark:bg-slate-800/30">
                {previewUrl ? <img src={previewUrl} className="h-32 sm:h-40 object-contain" alt="Preview" /> : (
                  <div className="text-center py-4">
                    <Upload className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={40} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Imagen Principal</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modelo</label>
                <input required className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-2 outline-none focus:border-blue-600 font-bold dark:text-white" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                <textarea className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-2 outline-none font-bold dark:text-white text-xs" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Precio x Día (S/)</label>
                <input type="number" step="0.01" required className="w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 py-2 outline-none focus:border-blue-600 text-2xl font-black dark:text-white italic font-sans" value={form.precioAlquiler} onChange={e => setForm({...form, precioAlquiler: parseFloat(e.target.value) || 0})} />
              </div>

              <button disabled={isSaving} type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 sm:py-5 rounded-2xl uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95 disabled:bg-gray-400">
                {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Estructura"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW: GALERÍA NAVEGABLE CON BOTONES Y SNAP-SCROLL */}
      {toldoPreview && (
        <div onClick={() => setToldoPreview(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setToldoPreview(null)} className="absolute top-4 right-4 bg-black/40 p-2 rounded-lg z-30 text-white hover:bg-black/60 transition-colors"><X size={18} /></button>
            
            {/* CONTENEDOR GALERÍA CON BOTONES LATERALES */}
            <div className="relative w-full h-[300px] bg-white group/gallery">
              <div 
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border-b dark:border-slate-800"
              >
                {toldoPreview.imagenes?.length ? toldoPreview.imagenes.map((img, i) => (
                  <img key={i} src={img.url} className="w-full h-full object-contain snap-center flex-shrink-0 p-6" alt="toldo" />
                )) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 font-black text-[10px] uppercase gap-2"><Tent size={40} /> Sin galería</div>
                )}
              </div>

              {/* Botones de navegación (Aparecen al pasar el mouse en PC o siempre visibles en móvil) */}
              {(toldoPreview.imagenes?.length ?? 0) > 1 && (
                <>
                  <button onClick={() => scrollGallery('left')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all z-20"><ChevronLeft size={20}/></button>
                  <button onClick={() => scrollGallery('right')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all z-20"><ChevronRight size={20}/></button>
                </>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
              <div className="space-y-1">
                <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest inline-block italic shadow-sm">Catálogo Premium</span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">{toldoPreview.modelo}</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest line-clamp-2">{toldoPreview.descripcion || 'Estructura modular'}</p>
              </div>

              <div className="flex justify-between items-center py-4 border-y dark:border-slate-800 transition-colors">
                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Inversión x Día</p><p className="text-2xl sm:text-3xl font-black text-blue-600 italic leading-none tracking-tighter">S/ {toldoPreview.precioAlquiler.toFixed(2)}</p></div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-500 justify-end"><Calendar size={12}/><span className="text-[10px] font-black uppercase tracking-tighter">Disponible</span></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter italic">Almacén Central</p>
                </div>
              </div>

              <button className="w-full bg-gray-950 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-xl">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}