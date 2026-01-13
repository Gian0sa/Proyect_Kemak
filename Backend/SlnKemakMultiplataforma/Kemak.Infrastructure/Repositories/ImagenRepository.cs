using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kemak.Infrastructure.Repositories;

public class ImagenRepository : IImagenRepository
{
    private readonly KemakDbContext _context;

    public ImagenRepository(KemakDbContext context) => _context = context;

    public async Task<IEnumerable<Imagen>> GetAllAsync()
        => await _context.Imagens.ToListAsync();

    public async Task<Imagen?> GetByIdAsync(int id)
        => await _context.Imagens.FindAsync(id);

    // ✅ CORREGIDO: Comparación case-insensitive para PostgreSQL
    public async Task<IEnumerable<Imagen>> GetByEntidadAsync(string tipo, int idEntidad)
    {
        return await _context.Imagens
            .Where(i => EF.Functions.ILike(i.TipoEntidad, tipo) && i.IdEntidad == idEntidad)
            .OrderBy(i => i.Orden)
            .ToListAsync();
    }

    public async Task<Imagen> CreateAsync(Imagen imagen)
    {
        await _context.Imagens.AddAsync(imagen);
        await _context.SaveChangesAsync();
        return imagen;
    }

    public async Task UpdateAsync(Imagen imagen)
    {
        _context.Imagens.Update(imagen);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var img = await GetByIdAsync(id);
        if (img == null) return false;

        _context.Imagens.Remove(img);
        await _context.SaveChangesAsync();
        return true;
    }
}