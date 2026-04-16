'use client';
import { useEffect, useState } from 'react';
import { licoreriaService, imagenService, ProductoLicoreriaDTO, ProductoLicoreriaCreateDTO } from '@/services';
import { 
  Plus, Search, Edit, Trash2, Eye, X, Upload, 
  Loader2, Package, Wine, TrendingUp, AlertCircle, ChevronRight, Boxes
} from 'lucide-react';

export default function LicoreriaPage() {
  // Estados de Datos
  const [productos, setProductos] = useState<ProductoLicoreriaDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Modales
  const [productoPreview, setProductoPreview] = useState<ProductoLicoreriaDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // Estados del Formulario
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoLicoreriaCreateDTO>({
    nombre: '',
    marca: '',
    categoria: 'Licor',
    precio: 0,
    stock: 0
  });

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await licoreriaService.getAll();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando licores", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const prepararEdicion = (p: ProductoLicoreriaDTO) => {
    setIdEditando(p.idProducto);
    setForm({
      nombre: p.nombre,
      marca: p.marca,
      categoria: p.categoria,
      precio: p.precio,
      stock: p.stock
    });
    setPreviewUrl(p.imagenes?.length ? p.imagenes[0].url : null);
    setIsModalOpen(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let prodResultado;
      if (idEditando) {
        const dataParaActualizar: ProductoLicoreriaDTO = { ...form, idProducto: idEditando };
        prodResultado = await licoreriaService.update(idEditando, dataParaActualizar);
      } else {
        prodResultado = await licoreriaService.create(form);
      }

      if (archivo && prodResultado.idProducto) {
        const formData = new FormData();
        formData.append('Archivo', archivo);
        formData.append('TipoEntidad', 'PRODUCTO_LICORERIA');
        formData.append('IdEntidad', prodResultado.idProducto.toString());
        formData.append('Descripcion', `Imagen de ${form.nombre}`);
        formData.append('Orden', '1');
        await imagenService.upload(formData);
      }

      setIsModalOpen(false);
      resetForm();
      await cargarProductos();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al procesar la solicitud");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', marca: '', categoria: 'Licor', precio: 0, stock: 0 });
    setArchivo(null);
    setPreviewUrl(null);
    setIdEditando(null);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      try {
        await licoreriaService.delete(id);
        await cargarProductos();
      } catch (error) { alert("Error al eliminar"); }
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
            Inventario <span className="text-orange-600">Licorería</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Wine size={12}/> Gestión de Productos y Bodega
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="group relative bg-slate-900 dark:bg-orange-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-orange-200 dark:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus size={20} strokeWidth={3} />
          <span className="uppercase text-xs tracking-widest">Añadir Producto</span>
        </button>
      </div>

      {/* 2. FILTROS Y BUSCADOR */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-2 shadow-sm">
           <Search className="ml-6 text-slate-300" size={22} />
           <input 
             type="text" 
             placeholder="Buscar licores, marcas o categorías..." 
             className="w-full px-4 py-4 bg-transparent outline-none font-bold text-sm dark:text-white placeholder:text-slate-300"
             value={busqueda}
             onChange={(e) => setBusqueda(e.target.value)}
           />
           <div className="hidden sm:flex gap-2 mr-4">
              <span className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                {productosFiltrados.length} Items
              </span>
           </div>
        </div>
      </div>

      {/* 3. GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-[2.5rem]" />
          ))
        ) : productosFiltrados.map((p) => (
          <div key={p.idProducto} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative">
            
            {/* Acciones Rápidas */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
               <button onClick={() => prepararEdicion(p)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all"><Edit size={16}/></button>
               <button onClick={() => handleEliminar(p.idProducto)} className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
            </div>

            {/* Area de Imagen */}
            <div className="h-48 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               {p.imagenes?.length ? (
                 <img src={p.imagenes[0].url} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.nombre} />
               ) : (
                 <Wine size={64} className="text-slate-200 dark:text-slate-700" />
               )}
               <button onClick={() => setProductoPreview(p)} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">Previsualizar</button>
            </div>

            {/* Información */}
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-1">
                 <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em]">{p.marca}</span>
                 <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">{p.categoria}</span>
               </div>
               <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight mb-4 group-hover:text-orange-600 transition-colors">{p.nombre}</h3>
               
               <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Precio</p>
                     <p className="text-lg font-black text-slate-900 dark:text-white italic">S/ {p.precio.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`text-[10px] font-black uppercase ${p.stock < 10 ? 'text-red-500' : 'text-slate-500'}`}>Stock: {p.stock}</span>
                     </div>
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
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-600 rounded-2xl text-white"><Boxes size={24}/></div>
                 <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase italic tracking-tighter">Detalle de Producto</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={28}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-10 grid grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="col-span-2 group relative h-56 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-orange-500 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} className="h-full w-full object-contain p-4" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arraste o suba la imagen</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                <input required className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold dark:text-white" 
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Marca</label>
                <input required className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold dark:text-white" 
                  value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría</label>
                <select className="w-full bg-slate-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold dark:text-white"
                  value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                  <option value="Licor">Licor</option>
                  <option value="Cerveza">Cerveza</option>
                  <option value="Vino">Vino</option>
                  <option value="Pisco">Pisco</option>
                </select>
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest ml-2">Precio de Venta (S/)</label>
                <input type="number" step="0.01" required className="w-full bg-orange-50 dark:bg-orange-900/10 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-orange-500/20 text-2xl font-black text-orange-600" 
                  value={form.precio} onChange={e => setForm({...form, precio: parseFloat(e.target.value)})} />
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Disponible</label>
                <input type="number" required className="w-full bg-slate-50 dark:bg-white/5 border-none p-5 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 text-2xl font-black dark:text-white" 
                  value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
              </div>

              <button disabled={isSaving} type="submit" className="col-span-2 bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] uppercase text-xs tracking-[0.3em] transition-all shadow-2xl shadow-orange-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <TrendingUp size={20}/>
                    {idEditando ? "Confirmar Actualización" : "Confirmar Alta"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. FICHA TÉCNICA (PREVIEW MODAL) */}
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
                      <span className="bg-orange-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">PRODUCTO ACTIVO</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: #{productoPreview.idProducto}</span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none italic">{productoPreview.nombre}</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest">{productoPreview.marca} • {productoPreview.categoria}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">P. Unitario</p>
                      <p className="text-3xl font-black text-orange-600">S/ {productoPreview.precio.toFixed(2)}</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Disponibilidad</p>
                      <p className={`text-3xl font-black ${productoPreview.stock < 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {productoPreview.stock} <span className="text-sm">und</span>
                      </p>
                   </div>
                </div>

                <div className="p-6 border-l-4 border-orange-500 bg-orange-500/5 rounded-r-3xl">
                   <p className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2 uppercase tracking-tighter">
                      <AlertCircle size={14}/> Nota de Stock: 
                   </p>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase leading-relaxed font-bold">
                      {productoPreview.stock < 10 ? 'Atención: Producto por agotarse. Reponer a la brevedad.' : 'Nivel de inventario saludable para venta inmediata.'}
                   </p>
                </div>

                <button onClick={() => setProductoPreview(null)} className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all">
                   Cerrar Ficha Técnica <ChevronRight size={18}/>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Auxiliar para estadísticas si lo deseas reutilizar
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-[3] transition-transform duration-700`} />
      <div className="flex items-center gap-5">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-transform`}>{icon}</div>
        <div className="z-10">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
      </div>
    </div>
  );
}