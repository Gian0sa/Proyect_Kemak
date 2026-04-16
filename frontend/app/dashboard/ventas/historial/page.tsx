'use client';
import { useEffect, useState } from 'react';
import { ventaService, ResumenIngresos } from '@/services/venta.service';
import { 
  TrendingUp, ShoppingBag, Store, Tent, Search, 
  Calendar, FileText, User, Loader2, Clock, ShieldCheck,
  ChevronLeft, ChevronRight, X, Printer, Receipt, MapPin, Phone
} from 'lucide-react';

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [resumen, setResumen] = useState<ResumenIngresos | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ventasData, resumenData] = await Promise.all([
        ventaService.getAll(),
        ventaService.getResumenIngresos()
      ]);
      setVentas(ventasData);
      setResumen(resumenData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const verDetalle = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await ventaService.getById(id);
      setSelectedVenta(data);
    } catch (error) {
      alert("Error al cargar la boleta");
    } finally {
      setLoadingDetail(false);
    }
  };

  const ventasFiltradas = ventas.filter(v => {
    const cumpleBusqueda = (v.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.idVenta.toString().includes(searchTerm);
    if (!fechaInicio || !fechaFin) return cumpleBusqueda;
    const f = new Date(v.fechaVenta).getTime();
    return cumpleBusqueda && (f >= new Date(fechaInicio).getTime() && f <= new Date(fechaFin).getTime());
  });

  const currentVentas = ventasFiltradas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 print:p-0">
      
      {/* SECCIÓN FILTROS (Oculta en Impresión) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">Historial de <span className="text-orange-600">Ventas</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Panel de Auditoría Kemak ERP</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100">
          <div className="flex flex-col px-3 border-r border-slate-100">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Desde</span>
            <input type="date" className="text-[11px] font-bold outline-none text-slate-700" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}/>
          </div>
          <div className="flex flex-col px-3">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hasta</span>
            <input type="date" className="text-[11px] font-bold outline-none text-slate-700" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN (Oculta en Impresión) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <StatCard title="Total Ingresos" value={`S/ ${resumen?.totalRecaudado?.toFixed(2)}`} icon={<TrendingUp />} color="bg-emerald-500" />
        <StatCard title="Área Licorería" value={`S/ ${resumen?.ventasLicoreria?.toFixed(2)}`} icon={<ShoppingBag />} color="bg-orange-600" />
        <StatCard title="Área Mayorista" value={`S/ ${resumen?.ventasMayorista?.toFixed(2)}`} icon={<Store />} color="bg-blue-600" />
        <StatCard title="Alquiler Toldos" value={`S/ ${resumen?.alquilerToldos?.toFixed(2)}`} icon={<Tent />} color="bg-purple-600" />
      </div>

      {/* TABLA MAESTRA (Oculta en Impresión) */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:hidden">
        <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg"><Receipt size={22} /></div>
             <h3 className="font-black uppercase text-[12px] tracking-widest text-slate-700">Registro de Transacciones</h3>
          </div>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder="Buscar por Cliente o ID..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-bold w-full focus:ring-4 ring-orange-500/10 outline-none transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="p-6">Documento</th>
                <th className="p-6">Cliente</th>
                <th className="p-6 text-center">Área</th>
                <th className="p-6 text-right">Importe</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentVentas.map((v) => (
                <tr key={v.idVenta} className="hover:bg-orange-50/20 transition-all group">
                  <td className="p-6">
                    <div className="flex flex-col"><span className="text-slate-900 font-black italic text-[11px]">#KEM-{v.idVenta.toString().padStart(6, '0')}</span><span className="text-slate-400 text-[9px] font-bold">{new Date(v.fechaVenta).toLocaleDateString()}</span></div>
                  </td>
                  <td className="p-6">
                    <p className="font-black uppercase text-[10px] text-slate-700">{v.clienteNombre || 'PÚBLICO GENERAL'}</p>
                    <p className="text-[9px] text-slate-400 font-bold">DNI: {v.clienteDni || '---'}</p>
                  </td>
                  <td className="p-6 text-center"><TypeBadge type={v.tipoVenta} /></td>
                  <td className="p-6 text-right font-black text-slate-900">S/ {v.montoTotal?.toFixed(2)}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => verDetalle(v.idVenta)} className="p-3 bg-white text-slate-400 hover:bg-orange-600 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95">
                      {loadingDetail ? <Loader2 className="animate-spin" size={16}/> : <FileText size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/50 border-t flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-400 uppercase">Página {currentPage} de {totalPages || 1}</span>
           <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white rounded-xl border disabled:opacity-30 hover:bg-orange-50 transition-all"><ChevronLeft size={18} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white rounded-xl border disabled:opacity-30 hover:bg-orange-50 transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>

      {/* --- MODAL BOLETA PREMIUM (NARANJA + FORMAL) --- */}
      {selectedVenta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300 print:relative print:bg-white print:p-0">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:rounded-none">
            
            {/* CABECERA BOLETA */}
            <div className="p-10 bg-orange-600 text-white flex justify-between items-start print:bg-white print:text-black print:border-b-4 print:border-black print:p-5 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="bg-white p-2 rounded-xl text-orange-600 print:hidden"><ShieldCheck size={24}/></div>
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">KEMAK CORPORACIÓN</h2>
                </div>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Distribución Mayorista & Servicios</p>
                <div className="flex flex-col text-[9px] opacity-60 font-bold uppercase tracking-tight">
                   <span className="flex items-center gap-1"><MapPin size={8}/> Ayacucho, Perú | RUC: 20600000000</span>
                   <span className="flex items-center gap-1"><Phone size={8}/> Soporte: +51 987 654 321</span>
                </div>
              </div>
              <div className="bg-slate-900/30 p-5 rounded-[2rem] text-center border-2 border-white/20 print:border-black print:bg-white min-w-[180px]">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Boleta de Venta</p>
                <p className="text-2xl font-black print:text-black">#KEM-{selectedVenta.idVenta?.toString().padStart(6, '0')}</p>
              </div>
              <button onClick={() => setSelectedVenta(null)} className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all print:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8 print:p-5 bg-white">
              {/* DATOS ADQUIRIENTE */}
              <div className="grid grid-cols-2 text-[11px] uppercase border-b border-slate-100 pb-8 print:border-black">
                <div className="space-y-1">
                  <p className="text-slate-400 font-black tracking-widest">Adquiriente:</p>
                  <p className="font-black text-slate-800 text-[13px]">{selectedVenta.clienteNombre}</p>
                  <p className="font-bold text-slate-500">DNI/RUC: {selectedVenta.clienteDni}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-slate-400 font-black tracking-widest">Fecha y Área:</p>
                  <p className="font-bold text-slate-800">{new Date(selectedVenta.fechaVenta).toLocaleString('es-PE')}</p>
                  <p className="font-black text-orange-600 italic uppercase">Caja: {selectedVenta.tipoVenta}</p>
                </div>
              </div>

              {/* LISTADO DE PRODUCTOS - LÓGICA DE NOMBRE MEJORADA */}
              <div className="min-h-[150px]">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 print:border-black text-slate-400 font-black uppercase tracking-widest">
                      <th className="py-4">Detalle del Producto</th>
                      <th className="py-4 text-center">Cant</th>
                      <th className="py-4 text-right">Precio</th>
                      <th className="py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 italic">
                    {(selectedVenta.detalles || []).map((det: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-black text-slate-700 uppercase tracking-tight">
                          {det.productoNombre}
                        </td>
                        <td className="py-4 text-center font-bold text-slate-400">x{det.cantidad}</td>
                        <td className="py-4 text-right font-bold">S/ {det.precioUnitario?.toFixed(2)}</td>
                        <td className="py-4 text-right font-black text-slate-900">S/ {(det.cantidad * det.precioUnitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SECCIÓN TOTALES */}
              <div className="flex justify-end pt-8">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-[11px] text-slate-400 font-black tracking-widest">
                    <span>OP. GRAVADA:</span>
                    <span>S/ {(selectedVenta.montoTotal / 1.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-black tracking-widest">
                    <span>IGV (18%):</span>
                    <span>S/ {(selectedVenta.montoTotal - (selectedVenta.montoTotal / 1.18)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 text-white p-5 rounded-3xl shadow-xl print:bg-white print:text-black print:border-4 print:border-black print:p-2">
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] self-center">Importe Total</span>
                    <span className="font-black text-3xl tracking-tighter">S/ {selectedVenta.montoTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN (Se ocultan en print) */}
              <div className="flex gap-4 pt-10 print:hidden">
                <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-2xl hover:scale-[1.02] active:scale-95">
                  <Printer size={18} /> Imprimir Comprobante
                </button>
                <button onClick={() => setSelectedVenta(null)} className="px-10 border-2 border-slate-100 text-slate-400 font-black py-5 rounded-2xl uppercase text-[10px] hover:bg-slate-50 transition-all">
                  Regresar
                </button>
              </div>
            </div>

            {/* FOOTER BOLETA */}
            <div className="p-8 bg-slate-50 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest print:bg-white print:border-t">
              Cajero Responsable: <span className="text-slate-900">{selectedVenta.usuarioNombre || 'SISTEMA'}</span> <br/>
              Boleta Generada por Kemak Enterprise ERP. <br/>
              ¡Gracias por elegir KEMAK CORPORACIÓN!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTES AUXILIARES ESTILIZADOS
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-[3] transition-transform duration-700`} />
      <div className="flex items-center gap-5">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-transform`}>{icon}</div>
        <div className="z-10">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: any = { 
    LICORERIA: 'bg-orange-100 text-orange-600 border-orange-200', 
    MAYORISTA: 'bg-blue-100 text-blue-600 border-blue-200', 
    TOLDO: 'bg-purple-100 text-purple-600 border-purple-200' 
  };
  return <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${styles[type] || 'bg-slate-100 text-slate-500'}`}>{type}</span>;
}