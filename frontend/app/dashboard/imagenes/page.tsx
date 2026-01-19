'use client';
import { useState, useEffect } from 'react';
import { imagenService, ImagenDto, licoreriaService, mayoristaService, toldoService } from '@/services/index';
import { UploadCloud, Trash2, Image as ImageIcon, Loader2, Plus, Search, Check, ListFilter } from 'lucide-react';

export default function GestionImagenesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [tipoEntidad, setTipoEntidad] = useState("PRODUCTO_LICORERIA");
  const [idEntidad, setIdEntidad] = useState<number>(0);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState<string>("");
  const [imagenes, setImagenes] = useState<ImagenDto[]>([]);

  const [allData, setAllData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingList(true);
      setIdEntidad(0);
      setEntidadSeleccionada("");
      setSearchTerm("");
      try {
        let data: any[] = [];
        if (tipoEntidad === "PRODUCTO_LICORERIA") data = await licoreriaService.getAll();
        else if (tipoEntidad === "PRODUCTO_MAYORISTA") data = await mayoristaService.getAll();
        else if (tipoEntidad === "TOLDO") data = await toldoService.getAll();
        
        setAllData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error cargando listado", error);
      } finally {
        setIsLoadingList(false);
      }
    };
    loadInitialData();
  }, [tipoEntidad]);

  // CORRECCIÓN CLAVE: Buscador adaptativo (nombre o modelo)
  useEffect(() => {
    const result = allData.filter(item => {
      if (!item) return false;
      
      // Si es TOLDO usamos item.modelo, sino item.nombre
      const campoBusqueda = tipoEntidad === "TOLDO" ? item.modelo : item.nombre;
      
      if (!campoBusqueda) return false;
      
      return campoBusqueda.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredData(result);
  }, [searchTerm, allData, tipoEntidad]);

  useEffect(() => {
    if (idEntidad > 0) cargarImagenes();
  }, [idEntidad]);

  const cargarImagenes = async () => {
    try {
      const data = await imagenService.getByEntidad(tipoEntidad, idEntidad);
      setImagenes(data);
    } catch (error) {
      setImagenes([]);
    }
  };

  const handleUpload = async () => {
    if (!file || idEntidad <= 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('Archivo', file); 
    formData.append('TipoEntidad', tipoEntidad);
    formData.append('IdEntidad', idEntidad.toString());

    try {
      await imagenService.upload(formData);
      setFile(null);
      setPreviewUrl(null);
      cargarImagenes();
      alert("¡Imagen sincronizada con éxito!");
    } catch (error) {
      alert("Error al subir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-white min-h-screen font-sans">
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Gestor Multimedia <span className="text-orange-600">Kemak</span>
        </h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
            Administración de Catálogo {tipoEntidad.replace('_', ' ')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA LISTADO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner h-[750px] flex flex-col">
            <div className="space-y-4 mb-6">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <ListFilter size={14} /> 1. Tipo de Catálogo
              </label>
              <select 
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={tipoEntidad}
                onChange={(e) => setTipoEntidad(e.target.value)}
              >
                <option value="PRODUCTO_LICORERIA">Licorería</option>
                <option value="PRODUCTO_MAYORISTA">Mayorista</option>
                <option value="TOLDO">Toldos (Eventos)</option>
              </select>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder={`Buscar ${tipoEntidad === 'TOLDO' ? 'modelo' : 'nombre'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:border-orange-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                  <Loader2 className="animate-spin mb-2" /> Cargando listado...
                </div>
              ) : filteredData.map((item) => (
                <button
                  key={item.idProducto || item.idToldo}
                  onClick={() => {
                    setIdEntidad(item.idProducto || item.idToldo);
                    setEntidadSeleccionada(tipoEntidad === "TOLDO" ? item.modelo : item.nombre);
                  }}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between group ${
                    idEntidad === (item.idProducto || item.idToldo)
                    ? "bg-orange-600 text-white shadow-lg scale-[1.02]"
                    : "bg-white hover:bg-orange-50 border border-slate-100"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-black uppercase italic text-sm ${idEntidad === (item.idProducto || item.idToldo) ? "text-white" : "text-slate-800"}`}>
                      {tipoEntidad === "TOLDO" ? item.modelo : item.nombre}
                    </span>
                    <span className={`text-[10px] font-bold ${idEntidad === (item.idProducto || item.idToldo) ? "text-orange-100" : "text-slate-400"}`}>
                      ID: {item.idProducto || item.idToldo} {item.marca && `| ${item.marca}`}
                    </span>
                  </div>
                  {idEntidad === (item.idProducto || item.idToldo) && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA SUBIDA Y GALERÍA */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECCIÓN DE SUBIDA */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col md:flex-row gap-8 items-center border-4 border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <ImageIcon size={120} />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
              {idEntidad > 0 ? (
                <>
                  <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em]">Seleccionado</p>
                  <h2 className="text-4xl font-black uppercase italic leading-none">{entidadSeleccionada}</h2>
                  <div className="flex justify-center md:justify-start gap-4">
                     <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter italic">ID: {idEntidad}</span>
                     <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter italic">{tipoEntidad}</span>
                  </div>
                </>
              ) : (
                <div className="py-4">
                    <h2 className="text-2xl font-black uppercase italic text-slate-500">Selecciona un elemento para empezar</h2>
                    <p className="text-slate-600 font-bold text-xs uppercase mt-2">Usa el buscador lateral para filtrar por {tipoEntidad === 'TOLDO' ? 'modelo' : 'nombre'}.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto relative z-10">
              <div className={`relative h-32 w-full md:w-64 rounded-3xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${previewUrl ? 'border-orange-500 bg-white' : 'border-white/20 hover:border-orange-500'}`}>
                <input type="file" onChange={(e) => {
                  if(e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                {previewUrl ? <img src={previewUrl} className="h-full object-contain" alt="Preview" /> : <UploadCloud size={32} className="text-white/20" />}
              </div>
              <button 
                onClick={handleUpload}
                disabled={loading || !file || idEntidad <= 0}
                className="bg-orange-600 py-4 px-8 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 hover:bg-white hover:text-orange-600 transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                {loading ? 'Subiendo...' : 'Registrar Kemak'}
              </button>
            </div>
          </div>

          {/* GALERÍA ACTUAL */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Activos en <span className="text-orange-600">Kemak</span></h3>
              <div className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">{imagenes.length} Recursos</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {imagenes.map((img) => (
                <div key={img.idImagen} className="group relative bg-white rounded-[2.5rem] p-4 shadow-xl border border-slate-50 transition-all hover:-translate-y-2">
                  <div className="h-44 bg-slate-50 rounded-[1.8rem] overflow-hidden flex items-center justify-center relative">
                    <img src={img.url} className="h-full w-full object-cover" alt="Recurso Kemak" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => imagenService.delete(img.idImagen!).then(cargarImagenes)} className="bg-red-600 text-white p-4 rounded-2xl transform scale-75 group-hover:scale-100 transition-all hover:bg-red-700 shadow-xl">
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase truncate">PublicID: {img.publicId}</p>
                  </div>
                </div>
              ))}
              
              {imagenes.length === 0 && (
                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-slate-50 rounded-[4rem] border-2 border-dotted border-slate-200">
                  <ImageIcon className="text-slate-200 mb-4" size={80} />
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center px-10">
                    {idEntidad > 0 ? "Sin fotos registradas para este modelo" : "Selecciona un activo del catálogo lateral"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}