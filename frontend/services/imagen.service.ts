import api from '@/lib/axios';

export interface ImagenDto {
  idImagen?: number;
  url: string;
  publicId: string;
  descripcion?: string;
  tipoEntidad: string; // "Licoreria" | "Mayorista" | "Toldo"
  idEntidad: number;
  orden?: number;
}

export const imagenService = {
  // Subir imagen a Cloudinary y registrar en DB
  upload: async (formData: FormData) => {
    // Se usa FormData porque enviamos un archivo físico
    const { data } = await api.post('/Imagen/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Obtener las imágenes de cualquier producto o toldo
  getByEntidad: async (tipo: string, id: number): Promise<ImagenDto[]> => {
    try {
      const { data } = await api.get<ImagenDto[]>(`/Imagen/${tipo}/${id}`);
      return data;
    } catch (error: any) {
      // Si el backend responde 404 porque no hay fotos, devolvemos array vacío para que no explote el front
      if (error.response?.status === 404) return [];
      throw error;
    }
  },

  // Eliminar imagen de la DB y de Cloudinary
  delete: async (id: number) => {
    await api.delete(`/Imagen/${id}`);
  }
};