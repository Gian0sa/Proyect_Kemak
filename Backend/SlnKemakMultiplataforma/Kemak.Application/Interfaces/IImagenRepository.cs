using Kemak.Domain.Models;

namespace Kemak.Application.Interfaces;

public interface IImagenRepository
{
    Task<IEnumerable<Imagen>> GetAllAsync();
    Task<Imagen?> GetByIdAsync(int id);
    Task<IEnumerable<Imagen>> GetByEntidadAsync(string tipo, int idEntidad);
    Task<Imagen> CreateAsync(Imagen imagen);
    Task UpdateAsync(Imagen imagen); // Para mover de posición u ordenar
    Task<bool> DeleteAsync(int id);
}