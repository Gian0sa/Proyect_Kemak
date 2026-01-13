using Kemak.Application.DTOs.Mayorista;
using Kemak.Domain.Models;

namespace Kemak.Application.Interfaces;

public interface IMayoristaRepository
{
    // Cambiado: Ahora devuelve una lista de DTOs que incluyen imágenes
    Task<IEnumerable<ProductoMayoristaDTO>> GetAllAsync();

    // Mantiene el retorno del modelo para procesos internos (como Update o Delete)
    Task<ProductoMayoristum?> GetByIdAsync(int id);

    // Devuelve el DTO detallado para la vista previa o landing page
    Task<ProductoMayoristaDTO?> GetDetalleAsync(int id);

    // Métodos de acción
    Task CreateAsync(ProductoMayoristum producto);
    Task UpdateAsync(ProductoMayoristum producto);
    Task DeleteAsync(int id);
}