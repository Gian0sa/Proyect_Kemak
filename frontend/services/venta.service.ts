import api from '@/lib/axios';

// Interfaces basadas en tus DTOs de C#
export interface DetalleVentaDTO {
  idItem: number;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaCreateDTO {
  idCliente: number;
  idUsuario: number;
  tipoVenta: 'LICORERIA' | 'MAYORISTA' | 'TOLDO';
  observaciones?: string;
  detalles: DetalleVentaDTO[];
  fechaInicio?: string; 
  fechaFin?: string;
}

export interface DevolucionToldoDTO {
  idAlquiler: number;
  observaciones: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'CANCELADO' | 'COMPLETADO' | 'MORA' | 'DAÑADO';
}

export interface ResumenIngresos {
  totalRecaudado: number;
  ventasLicoreria: number;
  ventasMayorista: number;
  alquilerToldos: number;
  cantidadOperaciones: number;
}

export const ventaService = {
  // POST: api/Venta - Registra venta y activa transacción en SQL
  registrar: async (venta: VentaCreateDTO) => {
    const { data } = await api.post('/Venta', venta);
    return data;
  },

  // GET: api/Venta/resumen-ingresos - Solo para Admin
  getResumenIngresos: async (): Promise<ResumenIngresos> => {
    const { data } = await api.get<ResumenIngresos>('/Venta/resumen-ingresos');
    return data;
  },

  // GET: api/Venta - Listado histórico para el Dashboard
  getAll: async () => {
    const { data } = await api.get('/Venta');
    return data;
  },

  // GET: api/Venta/{id} - Ver detalle de una boleta específica
  getById: async (id: number) => {
    const { data } = await api.get(`/Venta/${id}`);
    return data;
  },

  // PATCH: api/Venta/registrar-devolucion - Gestión de logística
  registrarDevolucion: async (dto: DevolucionToldoDTO) => {
    const { data } = await api.patch('/Venta/registrar-devolucion', dto);
    return data;
  }
};