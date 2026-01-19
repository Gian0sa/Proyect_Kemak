'use client';
import { useState, useEffect } from 'react';
import { licoreriaService, mayoristaService, toldoService, ventaService, clienteService } from '@/services/index';
import { Search, User, Trash2, CreditCard, Loader2, Plus, ShoppingCart, Minus } from 'lucide-react';

export default function POSPage() {
  const [tipoVenta, setTipoVenta] = useState<'LICORERIA' | 'MAYORISTA' | 'TOLDO'>('LICORERIA');
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [cantidadInput, setCantidadInput] = useState<number>(1);

  const [dniBusqueda, setDniBusqueda] = useState("");
  const [cliente, setCliente] = useState<any>(null);
  const [carrito, setCarrito] = useState<any[]>([]);

  
  const cargarCatalogoReal = async () => {
    setLoading(true);
    try {
      let res = [];
      if (tipoVenta === 'LICORERIA') res = await licoreriaService.getAll();
      else if (tipoVenta === 'MAYORISTA') res = await mayoristaService.getAll();
      else res = await toldoService.getAll();
      setCatalogo(res);
    } catch (e) {
      console.error("Error de comunicación con el servidor", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogoReal();
    setCarrito([]); 
  }, [tipoVenta]);

  const manejarBusquedaCliente = async () => {
    if (dniBusqueda.length !== 8) return alert("El DNI debe tener 8 dígitos");
    setLoadingCliente(true);
    try {
      const res = await clienteService.buscarORegistrarReniec(dniBusqueda);
      if (res) setCliente(res);
      else alert("Cliente no registrado en la base de datos.");
    } catch (e) { 
        alert("Error al validar identidad."); 
    } finally { 
        setLoadingCliente(false); 
    }
  };

 const agregarAlCarrito = (item: any) => {
    const idParaBackend = item.idItem || item.idProducto || item.idToldo;
    if (!idParaBackend) {
      return alert("Error: El producto no tiene un ID de Item vinculado en PostgreSQL.");
    }

    const existe = carrito.find(c => c.idItem === idParaBackend);
    const cantAAgregar = cantidadInput > 0 ? cantidadInput : 1;
    const stockDisp = item.stock ?? 999;

    
    if (tipoVenta !== 'TOLDO' && (cantAAgregar + (existe?.cantidad || 0)) > stockDisp) {
        return alert(`Stock insuficiente. Quedan ${stockDisp} unidades.`);
    }

    if (existe) {
      setCarrito(carrito.map(c => c.idItem === idParaBackend ? { ...c, cantidad: c.cantidad + cantAAgregar } : c));
    } else {
      setCarrito([...carrito, {
        idItem: idParaBackend,
        nombre: item.nombre || item.modelo,
        precioUnitario: item.precio || item.precioAlquiler,
        cantidad: cantAAgregar,
        stockMax: stockDisp
      }]);
    }
    setCantidadInput(1); 
  };

  const actualizarCantidadCarrito = (id: number, delta: number) => {
    setCarrito(carrito.map(c => {
      if (c.idItem === id) {
        const nuevaCant = c.cantidad + delta;
        if (nuevaCant > c.stockMax && tipoVenta !== 'TOLDO') {
            alert("No hay más stock disponible físicamente.");
            return c;
        }
        return nuevaCant > 0 ? { ...c, cantidad: nuevaCant } : c;
      }
      return c;
    }));
  };

  const totalVenta = carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

  const handleFinalizar = async () => {
    if (!cliente || carrito.length === 0) return alert("Faltan datos del cliente o productos en la boleta.");

    try {
      const ventaDto = {
        idCliente: cliente.idCliente,
        idUsuario: 1, 
        tipoVenta, 
        detalles: carrito.map(c => ({
          idItem: c.idItem,
          cantidad: c.cantidad,
          precioUnitario: c.precioUnitario
        }))
      };


      await ventaService.registrar(ventaDto);
      
      alert("¡Transacción Exitosa! El stock ha sido actualizado en PostgreSQL.");


      await cargarCatalogoReal();
      
      setCarrito([]);
      setCliente(null);
      setDniBusqueda("");
    } catch (e: any) { 
        console.error(e);
        alert(e.response?.data || "Error técnico: El stock en el servidor ha cambiado."); 
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-slate-50 font-sans">
      
      {/* SECCIÓN 1: CATÁLOGO LATERAL */}
      <div className="w-1/3 bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 border-b">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter italic">Selección</h2>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-3 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none focus:ring-2 focus:ring-orange-500"
              value={tipoVenta}
              onChange={(e) => setTipoVenta(e.target.value as any)}
            >
              <option value="LICORERIA">Licorería</option>
              <option value="MAYORISTA">Mayorista</option>
              <option value="TOLDO">Toldos / Alquiler</option>
            </select>
            <div className="flex items-center bg-slate-100 rounded-xl px-2 border-2 border-orange-500/20">
                <span className="text-[10px] font-black mr-2 italic tracking-tighter">CANT:</span>
                <input 
                  type="number" 
                  className="w-12 bg-transparent font-black text-center text-sm outline-none"
                  value={cantidadInput}
                  onChange={(e) => setCantidadInput(parseInt(e.target.value) || 1)}
                />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <Loader2 className="animate-spin mx-auto mt-10 text-orange-500" />
          ) : (
            catalogo
              .filter(i => (i.nombre || i.modelo).toLowerCase().includes(filtro.toLowerCase()))
              .map((item) => {
                const itemId = item.idItem || item.idProducto || item.idToldo;
                return (
                  <div 
                    key={`cat-${itemId}-${tipoVenta}`} // ✅ KEY ÚNICA PARA RENDERIZADO
                    className="p-3 bg-slate-50 rounded-xl flex justify-between items-center group hover:bg-orange-600 transition-all cursor-pointer shadow-sm border border-slate-100/50" 
                    onClick={() => agregarAlCarrito(item)}
                  >
                    <div className="flex-1 pr-2 overflow-hidden">
                      <p className="font-bold uppercase italic text-[11px] group-hover:text-white leading-tight break-words">
                        {item.nombre || item.modelo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] font-black text-slate-400 group-hover:text-orange-100 uppercase">
                            S/ {(item.precio || item.precioAlquiler).toFixed(2)}
                          </p>
                          {tipoVenta !== 'TOLDO' && (
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${item.stock < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                  STOCK: {item.stock}
                              </span>
                          )}
                      </div>
                    </div>
                    <Plus size={14} className="group-hover:text-white" strokeWidth={3} />
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* SECCIÓN 2: BOLETA Y VALIDACIÓN */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* IDENTIFICACIÓN DNI */}
        <div className="bg-slate-900 rounded-[2.5rem] p-5 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-orange-600 p-3 rounded-xl">
              {loadingCliente ? <Loader2 className="animate-spin" size={20} /> : <User size={20} />}
            </div>
            <div>
              <p className="text-orange-500 font-black text-[9px] uppercase tracking-widest italic">
                {cliente ? "Venta Identificada" : "Validación de Comprador"}
              </p>
              <h3 className="text-lg font-black uppercase italic truncate max-w-[300px]">
                {cliente ? cliente.nombre : "DNI Requerido"}
              </h3>
            </div>
          </div>
          <div className="flex gap-2 relative z-10">
            <input 
              type="text" 
              className="bg-white/10 p-3 rounded-xl border-none font-bold outline-none w-32 text-center text-sm"
              placeholder="75784274"
              value={dniBusqueda}
              onChange={(e) => setDniBusqueda(e.target.value)}
              maxLength={8}
            />
            <button className="bg-orange-600 px-5 rounded-xl font-black hover:bg-white hover:text-orange-600 transition-all text-[11px]" onClick={manejarBusquedaCliente}>
              VALIDAR
            </button>
          </div>
        </div>

        {/* LISTADO CARRITO */}
        <div className="flex-1 bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
                <ShoppingCart className="text-orange-600" size={20} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter italic">Resumen de Venta</h3>
            </div>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-500 uppercase">{carrito.length} Items</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {carrito.map((c) => (
              <div 
                key={`cart-${c.idItem}`} 
                className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50 shadow-sm"
              >
                <div className="flex-1 pr-4">
                  <p className="font-black uppercase text-xs italic leading-tight">{c.nombre}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    P. UNIT: S/ {c.precioUnitario.toFixed(2)} | <span className="text-orange-600 font-bold">DISP: {c.stockMax}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-lg border shadow-sm px-1">
                    <button onClick={() => actualizarCantidadCarrito(c.idItem, -1)} className="p-1 hover:text-orange-600 transition-colors"><Minus size={12}/></button>
                    <span className="text-xs font-black px-2">{c.cantidad}</span>
                    <button onClick={() => actualizarCantidadCarrito(c.idItem, 1)} className="p-1 hover:text-orange-600 transition-colors"><Plus size={12}/></button>
                  </div>
                  <p className="font-black text-sm italic min-w-[70px] text-right">S/ {(c.precioUnitario * c.cantidad).toFixed(2)}</p>
                  <button onClick={() => setCarrito(carrito.filter(i => i.idItem !== c.idItem))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Monto Total a Recaudar</p>
                <p className="text-5xl font-black italic text-slate-900 tracking-tighter font-sans">S/ {totalVenta.toFixed(2)}</p>
              </div>
              <button 
                className="bg-slate-950 text-white px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl disabled:bg-slate-200 disabled:text-slate-400"
                disabled={carrito.length === 0 || !cliente}
                onClick={handleFinalizar}
              >
                <CreditCard size={20} strokeWidth={3} /> PROCESAR VENTA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}