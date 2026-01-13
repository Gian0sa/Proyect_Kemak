using Kemak.Application.DTOs.ImagenDto;
using Kemak.Application.DTOs.ToldoDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Kemak.Infrastructure.Repositories;

public class ToldoRepository : IToldoRepository
{
    private readonly KemakDbContext _context;
    private readonly IDistributedCache _cache;
    private const string CacheKeyPrefix = "toldo_";
    private const string AllToldosCacheKey = "toldo_all_v3"; // Cambiado para limpiar caché

    public ToldoRepository(KemakDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // ✅ CORREGIDO: Usa Select en la query directamente
    public async Task<IEnumerable<ToldoDTO>> GetAllAsync()
    {
        try
        {
            var cachedData = await _cache.GetStringAsync(AllToldosCacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<IEnumerable<ToldoDTO>>(cachedData)
                       ?? new List<ToldoDTO>();
            }
        }
        catch { }

        // ✅ SOLUCIÓN: Query directa como Mayorista y Licorería
        var toldos = await _context.Toldos
            .Where(t => t.Activo == 1)
            .Select(t => new ToldoDTO
            {
                IdToldo = t.IdToldo,
                Modelo = t.Modelo ?? "",
                Descripcion = t.Descripcion ?? "",
                PrecioAlquiler = t.PrecioAlquiler,
                Imagenes = _context.Imagens
                    .Where(i => i.TipoEntidad == "TOLDO" && i.IdEntidad == t.IdToldo)
                    .OrderBy(i => i.Orden)
                    .Select(i => new ImagenReadDto
                    {
                        IdImagen = i.IdImagen,
                        Url = i.Url,
                        Descripcion = i.Descripcion,
                        Orden = i.Orden ?? 0
                    }).ToList()
            }).ToListAsync();

        try
        {
            var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(30));
            await _cache.SetStringAsync(AllToldosCacheKey, JsonSerializer.Serialize(toldos), options);
        }
        catch { }

        return toldos;
    }

    // ✅ CORREGIDO: Detalle completo
    public async Task<ToldoDTO?> GetToldoDetalleAsync(int id)
    {
        string cacheKey = $"{CacheKeyPrefix}{id}";
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<ToldoDTO>(cachedData);
            }
        }
        catch { }

        var toldo = await _context.Toldos
            .FirstOrDefaultAsync(t => t.IdToldo == id && t.Activo == 1);

        if (toldo == null) return null;

        var imagenes = await _context.Imagens
            .Where(i => i.TipoEntidad == "TOLDO" && i.IdEntidad == id)
            .OrderBy(i => i.Orden)
            .Select(i => new ImagenReadDto
            {
                IdImagen = i.IdImagen,
                Url = i.Url,
                Descripcion = i.Descripcion,
                Orden = i.Orden ?? 0
            }).ToListAsync();

        var dto = new ToldoDTO
        {
            IdToldo = toldo.IdToldo,
            Modelo = toldo.Modelo ?? "",
            Descripcion = toldo.Descripcion ?? "",
            PrecioAlquiler = toldo.PrecioAlquiler,
            Imagenes = imagenes
        };

        try
        {
            var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(60));
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto), options);
        }
        catch { }

        return dto;
    }

    public async Task<Toldo?> GetByIdAsync(int id)
        => await _context.Toldos.FirstOrDefaultAsync(t => t.IdToldo == id && t.Activo == 1);

    public async Task CreateAsync(Toldo toldo)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            toldo.Activo = 1;
            await _context.Toldos.AddAsync(toldo);
            await _context.SaveChangesAsync();

            var nuevoItem = new ItemVentum { TipoItem = "TOLDO" };
            await _context.ItemVenta.AddAsync(nuevoItem);
            await _context.SaveChangesAsync();

            var itemToldo = new ItemToldo
            {
                IdItem = nuevoItem.IdItem,
                IdToldo = toldo.IdToldo
            };
            await _context.ItemToldos.AddAsync(itemToldo);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            await _cache.RemoveAsync(AllToldosCacheKey);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateAsync(Toldo toldo)
    {
        _context.Toldos.Update(toldo);
        await _context.SaveChangesAsync();

        await _cache.RemoveAsync($"{CacheKeyPrefix}{toldo.IdToldo}");
        await _cache.RemoveAsync(AllToldosCacheKey);
    }

    public async Task DeleteAsync(int id)
    {
        var toldo = await GetByIdAsync(id);
        if (toldo != null)
        {
            toldo.Activo = 0;
            await _context.SaveChangesAsync();

            await _cache.RemoveAsync($"{CacheKeyPrefix}{id}");
            await _cache.RemoveAsync(AllToldosCacheKey);
        }
    }

    public async Task<IEnumerable<VwDisponibilidadToldo>> GetDisponibilidadAsync()
        => await _context.VwDisponibilidadToldos.ToListAsync();
}