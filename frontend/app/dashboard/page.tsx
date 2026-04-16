'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { 
  licoreriaService, mayoristaService, toldoService, ventaService,
  ProductoLicoreriaDTO, ProductoMayoristaDTO, ToldoDTO
} from '@/services';
import { 
  Wine, Package, Tent, TrendingUp, AlertTriangle, 
  ArrowUpRight, Loader2, RefreshCcw, BarChart3, History, 
  Layers, Wallet, Receipt, Calendar,
  Link
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<{
    licores: ProductoLicoreriaDTO[],
    mayorista: ProductoMayoristaDTO[],
    toldos: ToldoDTO[],
    ventas: any[],
    resumen: any | null
  }>({ licores: [], mayorista: [], toldos: [], ventas: [], resumen: null });
  
  const [loading, setLoading] = useState(true);
  const [filtroVentas, setFiltroVentas] = useState<'GENERAL' | 'LICORERIA' | 'MAYORISTA' | 'TOLDO'>('GENERAL');

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [resLicor, resMayor, resToldos, resVentas, resResumen] = await Promise.all([
        licoreriaService.getAll(),
        mayoristaService.getAll(),
        toldoService.getAll(),
        ventaService.getAll(),
        ventaService.getResumenIngresos()
      ]);
      setData({ 
        licores: resLicor, 
        mayorista: resMayor, 
        toldos: resToldos, 
        ventas: resVentas,
        resumen: resResumen
      });
    } catch (error) {
      console.error("Error en Dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE GRÁFICOS REALES ---
  const chartData = useMemo(() => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    
    return dias.map((nombre, i) => {
      const fechaBusqueda = new Date();
      fechaBusqueda.setDate(hoy.getDate() - (6 - i));
      const fechaStr = fechaBusqueda.toLocaleDateString();

      // Filtramos ventas por día y área
      const montoDia = data.ventas
        .filter(v => new Date(v.fechaVenta).toLocaleDateString() === fechaStr)
        .filter(v => filtroVentas === 'GENERAL' || v.tipoVenta === filtroVentas)
        .reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);

      return { name: nombre, monto: montoDia };
    });
  }, [data.ventas, filtroVentas]);

  // --- TRANSACCIONES FILTRADAS ---
  const transaccionesRecientes = useMemo(() => {
    return data.ventas
      .filter(v => filtroVentas === 'GENERAL' || v.tipoVenta === filtroVentas)
      .slice(0, 6);
  }, [data.ventas, filtroVentas]);

  const stockCritico = [...data.licores.filter(p => p.stock < 10), ...data.mayorista.filter(p => p.stock < 5)].slice(0, 4);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-orange-600" size={64} />
        <div className="absolute inset-0 m-auto w-8 h-8 bg-slate-900 rounded-full animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-bounce">Sincronizando Capital...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-10">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-4 rounded-[1.8rem] shadow-xl shadow-orange-200">
            <TrendingUp className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Dashboard <span className="text-orange-600">Financiero</span></h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">Mercado en tiempo real: KEMAK ERP</p>
            </div>
          </div>
        </div>
        <button onClick={cargarTodo} className="group p-4 bg-white dark:bg-slate-900 border rounded-[1.5rem] shadow-sm hover:border-orange-500 transition-all active:scale-90">
          <RefreshCcw className="text-slate-400 group-hover:text-orange-600 group-hover:rotate-180 transition-all duration-500" size={24}/>
        </button>
      </div>

      {/* 2. TARJETAS DE CAPITAL REAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CapitalCard title="Ventas Totales" value={`S/ ${data.resumen?.totalRecaudado?.toFixed(2)}`} sub="Acumulado histórico" icon={<Wallet />} color="orange" />
        <CapitalCard title="Licorería" value={`S/ ${data.resumen?.ventasLicoreria?.toFixed(2)}`} sub="Ingresos por licores" icon={<Wine />} color="blue" />
        <CapitalCard title="Distribución" value={`S/ ${data.resumen?.ventasMayorista?.toFixed(2)}`} sub="Canal mayorista" icon={<Package />} color="indigo" />
        <CapitalCard title="Alquileres" value={`S/ ${data.resumen?.alquilerToldos?.toFixed(2)}`} sub="Módulo de toldos" icon={<Tent />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. DIAGRAMA DE RENDIMIENTO POR DÍA */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 relative z-10">
            <div className="space-y-1">
              <h4 className="font-black uppercase italic tracking-tight text-2xl text-slate-800 dark:text-white">Flujo de Caja <span className="text-blue-600">Semanal</span></h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12}/> {filtroVentas} - ÚLTIMOS 7 DÍAS
              </p>
            </div>
            
            <div className="flex bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              {['GENERAL', 'LICORERIA', 'MAYORISTA', 'TOLDO'].map((f) => (
                <button key={f} onClick={() => setFiltroVentas(f as any)} 
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${filtroVentas === f ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '900', fill: '#94a3b8'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px'}}
                  cursor={{stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Area type="monotone" dataKey="monto" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMonto)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. STOCK CRÍTICO */}
        <div className="bg-slate-900 dark:bg-black rounded-[3.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h4 className="font-black uppercase italic text-xl tracking-tight">Alertas <span className="text-red-500">Stock</span></h4>
            <AlertTriangle className="text-red-500 animate-pulse" size={24} />
          </div>
          <div className="space-y-4 relative z-10">
            {stockCritico.length > 0 ? stockCritico.map((prod: any, idx) => (
              <div key={idx} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
                <p className="font-black uppercase text-[11px] truncate italic group-hover:text-orange-500 transition-colors">{prod.nombre || prod.modelo}</p>
                <div className="flex justify-between items-center mt-2">
                   <div className="h-1.5 flex-1 bg-white/10 rounded-full mr-4 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(prod.stock / 20) * 100}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-red-500">STK: {prod.stock}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-20"><Layers size={48} className="mx-auto mb-2"/> <p className="text-[10px] font-black uppercase">Inventario Óptimo</p></div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 5. HISTORIAL DINÁMICO DE TRANSACCIONES */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm overflow-hidden relative group">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-3xl text-slate-900 dark:text-white"><History size={26}/></div>
              <div>
                <h4 className="font-black uppercase italic text-2xl">Últimas Transacciones</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Auditoría de Movimientos</p>
              </div>
           </div>
           <Link href="/dashboard/ventas/reportpage" className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all">Ver Historial Completo</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b">
                <th className="pb-6">ID Venta</th>
                <th className="pb-6">Área / Módulo</th>
                <th className="pb-6">Cliente</th>
                <th className="pb-6 text-center">Estado</th>
                <th className="pb-6 text-right">Total Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {transaccionesRecientes.map((venta, i) => (
                <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                  <td className="py-7 font-black text-orange-600 italic">#VN-{venta.idVenta.toString().padStart(5, '0')}</td>
                  <td className="py-7">
                    <div className="flex items-center gap-3">
                       <AreaBadge type={venta.tipoVenta} />
                    </div>
                  </td>
                  <td className="py-7">
                    <div className="flex flex-col leading-none">
                       <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">{venta.clienteNombre}</span>
                       <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">DNI: {venta.clienteDni}</span>
                    </div>
                  </td>
                  <td className="py-7 text-center">
                    <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full text-emerald-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Pagado
                    </span>
                  </td>
                  <td className="py-7 text-right font-black text-2xl text-slate-900 dark:text-white tracking-tighter italic">S/ {venta.montoTotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function CapitalCard({ title, value, sub, icon, color }: any) {
  const colors: any = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.8rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500" />
      <div className={`p-4 rounded-2xl w-fit mb-5 shadow-lg group-hover:rotate-6 transition-transform ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-tight">{sub}</p>
    </div>
  );
}

function AreaBadge({ type }: { type: string }) {
  const styles: any = {
    LICORERIA: 'bg-blue-100 text-blue-600',
    MAYORISTA: 'bg-orange-100 text-orange-600',
    TOLDO: 'bg-emerald-100 text-emerald-600'
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20 ${styles[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
}