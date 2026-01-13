import api from '@/lib/axios';

// Espejo de ClienteDTO
export interface ClienteDTO {
  idCliente: number;
  nombre: string;
  dni: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fechaRegistro?: string;
}

// Espejo de ClienteCreateDTO
export interface ClienteCreateDTO {
  nombre: string;
  dni: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export const clienteService = {
  // GET: api/Cliente (Solo Admin)
  getAll: async (): Promise<ClienteDTO[]> => {
    const { data } = await api.get<ClienteDTO[]>('/Cliente');
    return data;
  },

  // GET: api/Cliente/{id}
  getById: async (id: number): Promise<ClienteDTO> => {
    const { data } = await api.get<ClienteDTO>(`/Cliente/${id}`);
    return data;
  },

  // GET: api/Cliente/dni/{dni} (Búsqueda local rápida)
  getByDni: async (dni: string): Promise<ClienteDTO> => {
    const { data } = await api.get<ClienteDTO>(`/Cliente/dni/${dni}`);
    return data;
  },

  // ESTRATÉGICO: GET: api/Cliente/buscar-reniec/{dni}
  // Busca en DB local -> Si no está, consulta RENIEC -> Registra -> Devuelve cliente
  buscarORegistrarReniec: async (dni: string): Promise<ClienteDTO> => {
    const { data } = await api.get<ClienteDTO>(`/Cliente/buscar-reniec/${dni}`);
    return data;
  },

  // POST: api/Cliente (Registro manual)
  create: async (cliente: ClienteCreateDTO) => {
    const { data } = await api.post('/Cliente', cliente);
    return data;
  },

  // PUT: api/Cliente/{id} (Actualiza solo contacto: Tel, Email, Dir)
  update: async (id: number, cliente: Partial<ClienteCreateDTO>) => {
    const { data } = await api.put(`/Cliente/${id}`, cliente);
    return data;
  },

  // DELETE: api/Cliente/{id} (Solo Admin)
  delete: async (id: number) => {
    await api.delete(`/Cliente/${id}`);
  }
};