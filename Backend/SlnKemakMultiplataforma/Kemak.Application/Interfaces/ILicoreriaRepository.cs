using Kemak.Application.DTOs.Licoreria;
using Kemak.Domain.Models;

namespace Kemak.Application.Interfaces;

public interface ILicoreriaRepository
{
    // Devuelve el DTO con imágenes para evitar múltiples llamadas desde el Controller
    Task<IEnumerable<ProductoLicoreriaDTO>> ObtenerTodosAsync();
    Task<ProductoLicorerium?> ObtenerPorIdAsync(int id);
    Task<ProductoLicoreriaDTO?> ObtenerDetalleAsync(int id);
    Task<ProductoLicorerium> CrearAsync(ProductoLicorerium producto);
    Task<bool> ActualizarAsync(ProductoLicorerium producto);
    Task<bool> EliminarAsync(int id);
}