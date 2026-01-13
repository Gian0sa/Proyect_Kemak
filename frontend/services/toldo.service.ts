import api from '@/lib/axios';

export interface ToldoDTO {
  idToldo: number;
  modelo: string;
  descripcion: string;
  precioAlquiler: number;
  imagenes?: any[]; 
}

export interface ToldoCreateDTO {
  modelo: string;
  descripcion: string;
  precioAlquiler: number;
}

// Interfaz para la Vista SQL de Disponibilidad
export interface VwDisponibilidadToldo {
  idToldo: number;
  modelo: string;
  estado: string; // 'ACTIVO', etc.
  fechaInicio?: string;
  fechaFin?: string;
}

export const toldoService = {
  // GET: api/Toldo (Público)
  getAll: async (): Promise<ToldoDTO[]> => {
    const { data } = await api.get<ToldoDTO[]>('/Toldo');
    return data;
  },

  // GET: api/Toldo/{id} (Público)
  getById: async (id: number): Promise<ToldoDTO> => {
    const { data } = await api.get<ToldoDTO>(`/Toldo/${id}`);
    return data;
  },

  // GET: api/Toldo/disponibilidad (Interno: Admin, Vendedor_Toldos)
  getDisponibilidad: async (): Promise<VwDisponibilidadToldo[]> => {
    const { data } = await api.get<VwDisponibilidadToldo[]>('/Toldo/disponibilidad');
    return data;
  },

  // POST: api/Toldo
  create: async (toldo: ToldoCreateDTO) => {
    const { data } = await api.post('/Toldo', toldo);
    return data;
  },

  // PUT: api/Toldo/{id}
  update: async (id: number, toldo: ToldoCreateDTO) => {
    const { data } = await api.put(`/Toldo/${id}`, toldo);
    return data;
  },

  // DELETE: api/Toldo/{id}
  delete: async (id: number) => {
    await api.delete(`/Toldo/${id}`);
  }
};