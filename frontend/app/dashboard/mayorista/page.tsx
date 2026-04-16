'use client';
import { useEffect, useState } from 'react';
import { mayoristaService, imagenService } from '@/services';
import { ProductoMayoristaDTO, ProductoMayoristaCreateDTO } from '@/services';
import { 
  Plus, Search, Edit, Trash2, Eye, X, Upload, 
  Loader2, Package, Boxes, TrendingUp, AlertCircle, ChevronRight
} from 'lucide-react';

export default function MayoristaPage() {
  const [productos, setProductos] = useState<ProductoMayoristaDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productoPreview, setProductoPreview] = useState<ProductoMayoristaDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoMayoristaCreateDTO>({
    nombre: '', marca: '', categoria: 'Gaseosas', presentacion: '', precio: 0, stock: 0
  });

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await mayoristaService.getAll();
      setProductos(data);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const prepararEdicion = (p: ProductoMayoristaDTO) => {
    setIdEditando(p.idProducto);
    setForm({
      nombre: p.nombre, marca: p.marca, categoria: 'Gaseosas', 
      presentacion: p.presentacion, precio: p.precio, stock: p.stock
    });
    setPreviewUrl(p.imagenes?.length ? p.imagenes[0].url : null);
    setIsModalOpen(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let prodResultado;
      if (idEditando) prodResultado = await mayoristaService.update(idEditando, form);
      else prodResultado = await mayoristaService.create(form);

      if (archivo && prodResultado.idProducto) {
        const fd = new FormData();
        fd.append('Archivo', archivo);
        fd.append('TipoEntidad', 'PRODUCTO_MAYORISTA');
        fd.append('IdEntidad', prodResultado.idProducto.toString());
        fd.append('Descripcion', `Imagen de ${form.nombre}`);
        fd.append('Orden', '1');
        await imagenService.upload(fd);
      }
      setIsModalOpen(false);
      resetForm();
      await cargarProductos();
    } catch (error) {
      alert("Error al procesar lote");
    } finally { setIsSaving(false); }
  };

  const resetForm = () => {
    setForm({ nombre: '', marca: '', categoria: 'Gaseosas', presentacion: '', precio: 0, stock: 0 });
    setArchivo(null);
    setPreviewUrl(null);
    setIdEditando(null);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Eliminar este lote permanentemente?")) {
      try {
        await mayoristaService.delete(id);
        await cargarProductos();
      } catch (error) { alert("Error al eliminar"); }
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. ESTRATEGIC HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
            Distribución <span className="text-blue-600">Mayorista</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Boxes size={12}/> Gestión de Inventario por Lotes
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="group relative bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-200 dark:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus size={20} strokeWidth={3} />
          <span className="uppercase text-xs tracking-widest">Registrar Nuevo Lote</span>
        </button>
      </div>

      {/* 2. FILTROS Y BUSCADOR */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-2 shadow-sm">
           <Search className="ml-6 text-slate-300" size={22} />
           <input 
             type="text" 
             placeholder="Buscar en el catálogo mayorista..." 
             className="w-full px-4 py-4 bg-transparent outline-none font-bold text-sm dark:text-white placeholder:text-slate-300"
             value={busqueda}
             onChange={(e) => setBusqueda(e.target.value)}
           />
           <div className="hidden sm:flex gap-2 mr-4">
              <span className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800">{productosFiltrados.length} Registros</span>
           </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-[2.5rem]" />
          ))
        ) : productosFiltrados.map((p) => (
          <div key={p.idProducto} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative">
            
            {/* Action Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
               <button onClick={() => prepararEdicion(p)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all"><Edit size={16}/></button>
               <button onClick={() => handleEliminar(p.idProducto)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
            </div>

            {/* Product Image Area */}
            <div className="h-48 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               {p.imagenes?.length ? (
                 <img src={p.imagenes[0].url} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.nombre} />
               ) : (
                 <Package size={64} className="text-slate-200 dark:text-slate-700" />
               )}
               <button onClick={() => setProductoPreview(p)} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">Vista Rápida</button>
            </div>

            {/* Info Area */}
            <div className="p-6 flex-1 flex flex-col">
               <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">{p.marca}</span>
               <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight mb-4 group-hover:text-blue-600 transition-colors">{p.nombre}</h3>
               
               <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Precio Lote</p>
                     <p className="text-lg font-black text-slate-900 dark:text-white italic">S/ {p.precio.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Stock: {p.stock} Unid.</span>
                     </div>
                     <span className="text-[9px] font-bold text-slate-300 uppercase">{p.presentacion}</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODAL REGISTRO/EDICIÓN - ULTRA MODERN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white"><Boxes size={24}/></div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Configurar Lote</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={28}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-10 grid grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Image Upload Area */}
              <div className="col-span-2 group relative h-56 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-blue-500 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} className="h-full w-full object-contain p-4" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensiones recomendadas: 800x800px</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Denominación</label>
                <input required placeholder="Ej: Gaseosa KR" className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold dark:text-white" 
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Marca / Fabricante</label>
                <input required placeholder="Ej: AJE" className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold dark:text-white" 
                  value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Formato de Presentación</label>
                <input required placeholder="Ej: Pack x 12 Botellas 3L" className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold dark:text-white" 
                  value={form.presentacion} onChange={e => setForm({...form, presentacion: e.target.value})} />
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Valor Lote (S/)</label>
                <input type="number" step="0.01" required className="w-full bg-blue-50 dark:bg-blue-900/10 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-blue-500/20 text-2xl font-black text-blue-600" 
                  value={form.precio} onChange={e => setForm({...form, precio: parseFloat(e.target.value)})} />
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cantidad en Almacén</label>
                <input type="number" required className="w-full bg-slate-50 dark:bg-white/5 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-blue-500/10 text-2xl font-black dark:text-white" 
                  value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
              </div>

              <button disabled={isSaving} type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] uppercase text-xs tracking-[0.3em] transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <TrendingUp size={20}/>
                    {idEditando ? "Sincronizar Cambios" : "Confirmar Alta de Lote"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. PREVIEW MODAL - CATALOG STYLE */}
      {productoPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setProductoPreview(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
             <div className="bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-12">
                {productoPreview.imagenes?.length ? (
                  <img src={productoPreview.imagenes[0].url} className="max-h-full drop-shadow-2xl hover:scale-110 transition-transform duration-700" alt={productoPreview.nombre} />
                ) : (
                  <Package size={120} className="text-slate-200" />
                )}
             </div>
             <div className="p-12 flex flex-col justify-center space-y-8 relative">
                <button onClick={() => setProductoPreview(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={32}/></button>
                
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">STOCK ACTIVO</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: #{productoPreview.idProducto}</span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none italic">{productoPreview.nombre}</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest">{productoPreview.marca} • {productoPreview.presentacion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Precio Unitario Lote</p>
                      <p className="text-3xl font-black text-blue-600">S/ {productoPreview.precio.toFixed(2)}</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Disponibilidad</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{productoPreview.stock} <span className="text-sm">und</span></p>
                   </div>
                </div>

                <div className="p-6 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-3xl">
                   <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-tighter">
                      <AlertCircle size={14}/> Nota de logística: 
                   </p>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase leading-relaxed font-bold">
                      Este producto pertenece al catálogo de distribución mayorista. Los lotes se actualizan cada 24 horas.
                   </p>
                </div>

                <button onClick={() => setProductoPreview(null)} className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3">
                   Cerrar Ficha Técnica <ChevronRight size={18}/>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTE AUXILIAR STATCARD REUTILIZADO PARA MAYORISTA
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-[3] transition-transform duration-700`} />
      <div className="flex items-center gap-5">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-transform`}>{icon}</div>
        <div className="z-10">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 uppercase italic">MAYORISTA</span>;
}