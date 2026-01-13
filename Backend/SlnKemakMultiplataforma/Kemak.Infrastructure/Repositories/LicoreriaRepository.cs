using Kemak.Application.DTOs.ImagenDto;
using Kemak.Application.DTOs.Licoreria;
using Kemak.Application.DTOs.ToldoDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Kemak.Infrastructure.Repositories;

public class LicoreriaRepository : ILicoreriaRepository
{
    private readonly KemakDbContext _context;
    private readonly IDistributedCache _cache;
    private const string CacheKeyPrefix = "licor_";
    private const string AllLicorCacheKey = "licor_all_v3"; // Llave actualizada para forzar refresco

    public LicoreriaRepository(KemakDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // 1. Obtener todos con Proyección Directa (Igual que Mayorista)
    public async Task<IEnumerable<ProductoLicoreriaDTO>> ObtenerTodosAsync()
    {
        try
        {
            var cachedData = await _cache.GetStringAsync(AllLicorCacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<IEnumerable<ProductoLicoreriaDTO>>(cachedData)
                       ?? new List<ProductoLicoreriaDTO>();
            }
        }
        catch { }

        // ✅ Usamos Select directamente para traer todo en una sola consulta SQL
        var resultado = await _context.ProductoLicoreria
            .Where(p => p.Activo == 1)
            .Select(p => new ProductoLicoreriaDTO
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Marca = p.Marca,
                Categoria = p.Categoria,
                Precio = p.Precio,
                Stock = p.Stock,
                Imagenes = _context.Imagens
                    .Where(i => i.TipoEntidad == "PRODUCTO_LICORERIA" && i.IdEntidad == p.IdProducto)
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
            await _cache.SetStringAsync(AllLicorCacheKey, JsonSerializer.Serialize(resultado), options);
        }
        catch { }

        return resultado;
    }

    public async Task<ProductoLicoreriaDTO?> ObtenerDetalleAsync(int id)
    {
        string cacheKey = $"{CacheKeyPrefix}{id}";
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData)) return JsonSerializer.Deserialize<ProductoLicoreriaDTO>(cachedData);
        }
        catch { }

        var dto = await _context.ProductoLicoreria
            .Where(p => p.IdProducto == id && p.Activo == 1)
            .Select(p => new ProductoLicoreriaDTO
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Marca = p.Marca,
                Categoria = p.Categoria,
                Precio = p.Precio,
                Stock = p.Stock,
                Imagenes = _context.Imagens
                    .Where(i => i.TipoEntidad == "PRODUCTO_LICORERIA" && i.IdEntidad == id)
                    .OrderBy(i => i.Orden)
                    .Select(i => new ImagenReadDto
                    {
                        IdImagen = i.IdImagen,
                        Url = i.Url,
                        Descripcion = i.Descripcion,
                        Orden = i.Orden ?? 0
                    }).ToList()
            }).FirstOrDefaultAsync();

        if (dto != null)
        {
            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto), new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(60)));
            }
            catch { }
        }

        return dto;
    }

    public async Task<ProductoLicorerium?> ObtenerPorIdAsync(int id)
        => await _context.ProductoLicoreria.FirstOrDefaultAsync(p => p.IdProducto == id && p.Activo == 1);

    public async Task<ProductoLicorerium> CrearAsync(ProductoLicorerium producto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            producto.Activo = 1;
            await _context.ProductoLicoreria.AddAsync(producto);
            await _context.SaveChangesAsync();

            var nuevoItem = new ItemVentum { TipoItem = "LICORERIA" };
            await _context.ItemVenta.AddAsync(nuevoItem);
            await _context.SaveChangesAsync();

            await _context.ItemProductoLicoreria.AddAsync(new ItemProductoLicorerium
            {
                IdItem = nuevoItem.IdItem,
                IdProducto = producto.IdProducto
            });
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            await _cache.RemoveAsync(AllLicorCacheKey);
            return producto;
        }
        catch { await transaction.RollbackAsync(); throw; }
    }

    // 🚀 ACTUALIZAR CORREGIDO PARA GESTIONAR IMÁGENES
    public async Task<bool> ActualizarAsync(ProductoLicorerium producto)
    {
        // 1. Deshabilitar el rastreo para evitar conflictos de entidad
        _context.Entry(producto).State = EntityState.Modified;

        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            // ✅ CRÍTICO: Eliminar caché individual y general
            // Esto obliga al frontend a pedir los datos nuevos (incluyendo las nuevas fotos)
            await _cache.RemoveAsync($"{CacheKeyPrefix}{producto.IdProducto}");
            await _cache.RemoveAsync(AllLicorCacheKey);
        }
        return result;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var producto = await ObtenerPorIdAsync(id);
        if (producto == null) return false;

        producto.Activo = 0;
        var result = await _context.SaveChangesAsync() > 0;

        if (result)
        {
            await _cache.RemoveAsync($"{CacheKeyPrefix}{id}");
            await _cache.RemoveAsync(AllLicorCacheKey);
        }
        return result;
    }
}