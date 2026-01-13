using Kemak.Application.DTOs.ToldoDto;
using Kemak.Domain.Models;

namespace Kemak.Application.Interfaces
{
    public interface IToldoRepository
    {
        Task<IEnumerable<ToldoDTO>> GetAllAsync();
        Task<Toldo?> GetByIdAsync(int id);
        // NUEVO: Método para obtener el DTO completo con Imágenes y Redis
        Task<ToldoDTO?> GetToldoDetalleAsync(int id);
        Task CreateAsync(Toldo toldo);
        Task UpdateAsync(Toldo toldo);
        Task DeleteAsync(int id);
        Task<IEnumerable<VwDisponibilidadToldo>> GetDisponibilidadAsync();
    }
}