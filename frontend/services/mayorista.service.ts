import api from '@/lib/axios';

export interface ProductoMayoristaDTO {
  idProducto: number;
  nombre: string;
  marca: string;
  presentacion: string; 
  precio: number;
  stock: number;
  imagenes?: any[];
}

export interface ProductoMayoristaCreateDTO {
  nombre: string;
  marca: string;
  categoria: string;
  presentacion: string;
  precio: number;
  stock: number;
}

export const mayoristaService = {
  getAll: async (): Promise<ProductoMayoristaDTO[]> => {
    const { data } = await api.get<ProductoMayoristaDTO[]>('/Mayorista');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/Mayorista/${id}`);
    return data;
  },

  create: async (producto: ProductoMayoristaCreateDTO) => {
    const { data } = await api.post('/Mayorista', producto);
    return data;
  },

  update: async (id: number, producto: ProductoMayoristaCreateDTO) => {
    const { data } = await api.put(`/Mayorista/${id}`, producto);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/Mayorista/${id}`);
  }
};