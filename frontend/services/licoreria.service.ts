import api from '@/lib/axios';

// Espejo de ProductoLicoreriaDTO (Para lectura y actualización)
export interface ProductoLicoreriaDTO {
  idProducto: number;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
  imagenes?: any[];
}

// Espejo de ProductoLicoreriaCreateDTO (Para creación)
export interface ProductoLicoreriaCreateDTO {
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
}

export const licoreriaService = {
  // GET: api/Licoreria -> Público
  getAll: async (): Promise<ProductoLicoreriaDTO[]> => {
    const { data } = await api.get<ProductoLicoreriaDTO[]>('/Licoreria');
    return data;
  },

  // GET: api/Licoreria/{id} -> Público
  // Este trae el detalle con imágenes si configuraste el repositorio así
  getById: async (id: number): Promise<any> => {
    const { data } = await api.get(`/Licoreria/${id}`);
    return data;
  },

  // POST: api/Licoreria -> Requiere Admin/Vendedor_Licoreria
  create: async (producto: ProductoLicoreriaCreateDTO) => {
    const { data } = await api.post('/Licoreria', producto);
    return data;
  },

  // PUT: api/Licoreria/{id} -> Requiere Admin/Vendedor_Licoreria
  update: async (id: number, producto: ProductoLicoreriaDTO) => {
    const { data } = await api.put(`/Licoreria/${id}`, producto);
    return data;
  },

  // DELETE: api/Licoreria/{id} -> Solo Admin
  delete: async (id: number) => {
    await api.delete(`/Licoreria/${id}`);
  }
};