'use client';
import { useEffect, useState } from 'react';
import { mayoristaService, imagenService } from '@/services';
import { ProductoMayoristaDTO, ProductoMayoristaCreateDTO } from '@/services';
import { Plus, Search, Edit, Trash2, Eye, X, Upload, Loader2, Package } from 'lucide-react';

export default function MayoristaPage() {
  // Estados de Datos
  const [productos, setProductos] = useState<ProductoMayoristaDTO[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Modales
  const [productoPreview, setProductoPreview] = useState<ProductoMayoristaDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // Estados del Formulario
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoMayoristaCreateDTO>({
    nombre: '', 
    marca: '', 
    categoria: 'Gaseosas', 
    presentacion: '',
    precio: 0, 
    stock: 0
  });

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await mayoristaService.getAll();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando mayorista", error);
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

  const prepararEdicion = (p: ProductoMayoristaDTO) => {
    setIdEditando(p.idProducto);
    setForm({
      nombre: p.nombre,
      marca: p.marca,
      categoria: 'Gaseosas', 
      presentacion: p.presentacion,
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
        prodResultado = await mayoristaService.update(idEditando, form);
      } else {
        prodResultado = await mayoristaService.create(form);
      }

      if (archivo && prodResultado.idProducto) {
        const fd = new FormData();
        fd.append('Archivo', archivo);
        fd.append('TipoEntidad', 'PRODUCTO_MAYORISTA'); 
        fd.append('IdEntidad', prodResultado.idProducto.toString());
        // ✅ Se rellena solo la descripción igual que en Licorería
        fd.append('Descripcion', `Imagen de ${form.nombre} - ${form.presentacion}`);
        fd.append('Orden', '1');
        await imagenService.upload(fd);
      }

      setIsModalOpen(false);
      resetForm();
      await cargarProductos(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al procesar el lote");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      nombre: '', 
      marca: '', 
      categoria: 'Gaseosas', 
      presentacion: '', 
      precio: 0, 
      stock: 0 
    });
    setArchivo(null);
    setPreviewUrl(null);
    setIdEditando(null);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Eliminar este lote del inventario?")) {
      try {
        await mayoristaService.delete(id);
        await cargarProductos();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER ADAPTADO PARA MÓVIL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-slate-100 uppercase italic tracking-tighter">
          Distribución Mayorista
        </h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none uppercase text-xs"
        >
          <Plus size={18} /> Nuevo Lote
        </button>
      </div>

      {/* BUSCADOR ADAPTADO */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar productos..."
          className="w-full pl-12 pr-4 py-4 border rounded-xl bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-gray-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* VISTA LAPTOP: TABLA (Igual a la tuya pero con hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-5">Producto / Marca</th>
              <th className="px-6 py-5">Presentación</th>
              <th className="px-6 py-5">Precio Lote</th>
              <th className="px-6 py-5">Stock Disp.</th>
              <th className="px-6 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Sincronizando...</td></tr>
            ) : productosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-gray-400 font-bold uppercase text-xs">No se encontraron productos</td></tr>
            ) : productosFiltrados.map((p) => (
              <tr key={p.idProducto} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-3">
                  {p.imagenes?.length ? (
                    <img src={p.imagenes[0].url} className="w-10 h-10 object-contain bg-white rounded-lg border shadow-sm" alt={p.nombre} />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-gray-400"/>
                    </div>
                  )}
                  <div>
                    <div className="font-black text-gray-800 dark:text-slate-100 uppercase">{p.nombre}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.marca}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 text-xs">{p.presentacion}</td>
                <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400 italic">S/ {p.precio.toFixed(2)}</td>
                <td className="px-6 py-4 font-black text-gray-800 dark:text-slate-200">{p.stock} Paquetes</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setProductoPreview(p)} className="text-gray-400 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
                    <button onClick={() => prepararEdicion(p)} className="text-gray-400 hover:text-amber-500 transition-colors"><Edit size={18}/></button>
                    <button onClick={() => handleEliminar(p.idProducto)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL: CARDS (Nueva sección responsiva) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400 animate-pulse font-black uppercase text-xs">Cargando...</p>
        ) : productosFiltrados.map((p) => (
          <div key={p.idProducto} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border dark:border-slate-700">
                {p.imagenes?.length ? (
                  <img src={p.imagenes[0].url} className="w-full h-full object-contain" alt={p.nombre} />
                ) : (
                  <Package size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-800 dark:text-white uppercase text-sm truncate">{p.nombre}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.marca} • {p.presentacion}</p>
                <p className="text-blue-600 dark:text-blue-400 font-black italic">S/ {p.precio.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t dark:border-slate-800">
              <span className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase text-gray-500">Stock: {p.stock}</span>
              <div className="flex gap-2">
                <button onClick={() => setProductoPreview(p)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600"><Eye size={16}/></button>
                <button onClick={() => prepararEdicion(p)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-amber-500"><Edit size={16}/></button>
                <button onClick={() => handleEliminar(p.idProducto)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL REGISTRO/EDICIÓN (Adaptado para móvil con scroll y posicionamiento) */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic tracking-tighter">
                {idEditando ? 'Actualizar Lote' : 'Alta de Lote Mayorista'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 sm:p-10 grid grid-cols-2 gap-4 sm:gap-6 max-h-[80vh] overflow-y-auto">
              <div className="col-span-2 flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[32px] p-6 relative bg-gray-50/30 dark:bg-slate-800/30">
                {previewUrl ? (
                  <img src={previewUrl} className="h-32 sm:h-40 object-contain" alt="Preview" />
                ) : (
                  <div className="text-center py-4">
                    <Upload className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={40} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Imagen del Producto</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                <input required className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700 py-2 outline-none focus:border-blue-600 font-bold dark:text-white" 
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marca</label>
                <input required className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700 py-2 outline-none focus:border-blue-600 font-bold dark:text-white" 
                  value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Presentación</label>
                <input required placeholder="Ej: Caja x 12 unidades" className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700 py-2 outline-none focus:border-blue-600 font-bold dark:text-white" 
                  value={form.presentacion} onChange={e => setForm({...form, presentacion: e.target.value})} />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Precio Lote</label>
                <input type="number" step="0.01" required className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700 py-2 outline-none focus:border-blue-600 text-xl font-black dark:text-white" 
                  value={form.precio} onChange={e => setForm({...form, precio: parseFloat(e.target.value)})} />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                <input type="number" required className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-700 py-2 outline-none focus:border-blue-600 text-xl font-black dark:text-white" 
                  value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
              </div>

              <button disabled={isSaving} type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 sm:py-5 rounded-2xl uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95">
                {isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : idEditando ? "Actualizar Inventario" : "Registrar en Almacén"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW (Adaptado para móvil) */}
      {productoPreview && (
        <div onClick={() => setProductoPreview(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative transition-all animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setProductoPreview(null)} className="absolute top-4 right-4 bg-black/40 p-2 rounded-lg z-20 text-white hover:bg-black/60 transition-colors"><X size={18} /></button>
            <div className="w-full h-[300px] bg-white flex items-center justify-center border-b dark:border-slate-800">
              {productoPreview.imagenes?.length ? (
                <img src={productoPreview.imagenes[0].url} className="w-full h-full object-contain p-6 scale-95" alt={productoPreview.nombre} />
              ) : (
                <div className="text-gray-300 font-black text-xs uppercase flex flex-col items-center gap-2"><Package size={50} /> <span>Sin imagen</span></div>
              )}
            </div>
            <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
              <div className="space-y-1">
                <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest inline-block transition-colors">MAYORISTA</span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase line-clamp-2">{productoPreview.nombre}</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{productoPreview.marca} - {productoPreview.presentacion}</p>
              </div>
              <div className="flex justify-between items-center py-4 border-y dark:border-slate-800 transition-colors">
                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Precio Lote</p><p className="text-2xl sm:text-3xl font-black text-blue-600 italic leading-none">S/ {productoPreview.precio.toFixed(2)}</p></div>
                <div className="text-right"><p className="text-[9px] font-black text-gray-400 uppercase">Disp. Actual</p><p className="text-xl font-black text-gray-800 dark:text-slate-100">{productoPreview.stock} LOTES</p></div>
              </div>
              <button className="w-full bg-gray-950 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}