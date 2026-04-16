'use client';
import { useState, useEffect } from 'react';
import { licoreriaService, mayoristaService, toldoService, ventaService, clienteService } from '@/services/index';
import { Search, User, Trash2, CreditCard, Loader2, Plus, ShoppingCart, Minus, Package } from 'lucide-react';

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
      let res: any[] = [];
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
    } catch {
      alert("Error al validar identidad.");
    } finally {
      setLoadingCliente(false);
    }
  };

  const agregarAlCarrito = (item: any) => {
    const idParaBackend = item.idItem || item.idProducto || item.idToldo;
    if (!idParaBackend) return alert("Error: El producto no tiene un ID de Item vinculado.");

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
        stockMax: stockDisp,
      }]);
    }
    setCantidadInput(1);
  };

  const actualizarCantidadCarrito = (id: number, delta: number) => {
    setCarrito(carrito.map(c => {
      if (c.idItem === id) {
        const nuevaCant = c.cantidad + delta;
        if (nuevaCant > c.stockMax && tipoVenta !== 'TOLDO') {
          alert("No hay más stock disponible.");
          return c;
        }
        return nuevaCant > 0 ? { ...c, cantidad: nuevaCant } : c;
      }
      return c;
    }));
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);

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
          precioUnitario: c.precioUnitario,
        })),
      };
      await ventaService.registrar(ventaDto);
      alert("¡Transacción exitosa! El stock se ha actualizado.");
      setTimeout(async () => { await cargarCatalogoReal(); }, 600);
      setCarrito([]);
      setCliente(null);
      setDniBusqueda("");
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data || "Error técnico al procesar la venta.");
    }
  };

  const tipoLabel: Record<string, string> = {
    LICORERIA: 'Licorería',
    MAYORISTA: 'Mayorista',
    TOLDO: 'Toldos / Alquiler',
  };

  const inicialesCliente = cliente?.nombre
    ? cliente.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 font-sans">

      {/* ───────────── PANEL IZQUIERDO: CATÁLOGO ───────────── */}
      <aside className="w-72 xl:w-80 bg-white border-r border-slate-200 flex flex-col">

        {/* Header catálogo */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Catálogo</span>
          </div>

          {/* Tipo venta */}
          <select
            className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium outline-none focus:border-slate-400 transition-colors cursor-pointer"
            value={tipoVenta}
            onChange={e => setTipoVenta(e.target.value as any)}
          >
            <option value="LICORERIA">Licorería</option>
            <option value="MAYORISTA">Mayorista</option>
            <option value="TOLDO">Toldos / Alquiler</option>
          </select>

          {/* Cantidad + búsqueda */}
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-24">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Cant.</span>
              <input
                type="number"
                min={1}
                value={cantidadInput}
                onChange={e => setCantidadInput(parseInt(e.target.value) || 1)}
                className="w-8 bg-transparent text-sm font-semibold text-slate-700 text-center outline-none"
              />
            </div>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {catalogo.length} productos disponibles
          </p>
        </div>

        {/* Lista productos */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : catalogo.filter(i => (i.nombre || i.modelo).toLowerCase().includes(filtro.toLowerCase())).length === 0 ? (
            <p className="text-center text-slate-400 text-sm mt-10">Sin resultados</p>
          ) : (
            catalogo
              .filter(i => (i.nombre || i.modelo).toLowerCase().includes(filtro.toLowerCase()))
              .map(item => {
                const itemId = item.idItem || item.idProducto || item.idToldo;
                const stockBajo = item.stock !== undefined && item.stock < 10;
                return (
                  <button
                    key={`cat-${itemId}-${tipoVenta}`}
                    onClick={() => agregarAlCarrito(item)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors group mb-0.5"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-medium text-slate-800 truncate leading-tight">
                        {item.nombre || item.modelo}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">
                          S/ {(item.precio || item.precioAlquiler).toFixed(2)}
                        </span>
                        {tipoVenta !== 'TOLDO' && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${stockBajo ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            {item.stock} uds.
                          </span>
                        )}
                      </div>
                    </div>
                    <Plus size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                  </button>
                );
              })
          )}
        </div>
      </aside>

      {/* ───────────── PANEL DERECHO: BOLETA ───────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Barra superior: cliente */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${cliente ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            {loadingCliente
              ? <Loader2 size={16} className="animate-spin" />
              : inicialesCliente ?? <User size={16} />
            }
          </div>

          {/* Info cliente */}
          <div className="flex-1 min-w-0">
            {cliente ? (
              <>
                <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{cliente.nombre}</p>
                <p className="text-[11px] text-slate-400">DNI {cliente.dni ?? dniBusqueda} · Cliente identificado</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-500">Sin cliente asignado</p>
                <p className="text-[11px] text-slate-400">Ingrese el DNI para continuar</p>
              </>
            )}
          </div>

          {/* DNI input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="DNI (8 dígitos)"
              maxLength={8}
              value={dniBusqueda}
              onChange={e => setDniBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && manejarBusquedaCliente()}
              className="w-36 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-400 transition-colors text-center tracking-widest font-mono"
            />
            <button
              onClick={manejarBusquedaCliente}
              disabled={loadingCliente}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validar
            </button>
            {cliente && (
              <button
                onClick={() => { setCliente(null); setDniBusqueda(""); }}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-sm text-slate-400 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </header>

        {/* Sub-barra: tipo venta + contador */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Boleta de venta
            </span>
            <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-medium">
              {tipoLabel[tipoVenta]}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {/* Lista carrito */}
        <div className="flex-1 overflow-y-auto bg-white">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
              <ShoppingCart size={40} strokeWidth={1} />
              <p className="text-sm font-medium">El carrito está vacío</p>
              <p className="text-xs">Selecciona productos del catálogo</p>
            </div>
          ) : (
            <>
              {/* Encabezado tabla */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2 border-b border-slate-100 bg-slate-50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Producto</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Precio unit.</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Cantidad</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Subtotal</span>
              </div>

              {carrito.map(c => (
                <div
                  key={`cart-${c.idItem}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Nombre */}
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-tight">{c.nombre}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Disp: {c.stockMax === 999 ? '∞' : c.stockMax} uds.
                    </p>
                  </div>

                  {/* Precio unitario */}
                  <span className="text-sm text-slate-500 text-center min-w-[72px]">
                    S/ {c.precioUnitario.toFixed(2)}
                  </span>

                  {/* Control cantidad */}
                  <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden min-w-[96px]">
                    <button
                      onClick={() => actualizarCantidadCarrito(c.idItem, -1)}
                      className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-500 transition-colors text-sm font-medium"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold text-slate-800 border-x border-slate-200 min-w-[32px] text-center">
                      {c.cantidad}
                    </span>
                    <button
                      onClick={() => actualizarCantidadCarrito(c.idItem, 1)}
                      className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-500 transition-colors text-sm font-medium"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-sm font-semibold text-slate-800 min-w-[80px] text-right">
                      S/ {(c.precioUnitario * c.cantidad).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setCarrito(carrito.filter(i => i.idItem !== c.idItem))}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer: total + botón */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-6">

          {/* Resumen numérico */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</p>
              <p className="text-sm font-medium text-slate-600">S/ {totalVenta.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">IGV (18%)</p>
              <p className="text-sm font-medium text-slate-600">S/ {(totalVenta * 0.18).toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
              <p className="text-2xl font-bold text-slate-900">S/ {totalVenta.toFixed(2)}</p>
            </div>
          </div>

          {/* Botón procesar */}
          <button
            disabled={carrito.length === 0 || !cliente}
            onClick={handleFinalizar}
            className="flex items-center gap-2.5 px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 active:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <CreditCard size={16} />
            Procesar venta
          </button>
        </footer>
      </main>
    </div>
  );
}