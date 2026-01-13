using Kemak.Application.DTOs.ImagenDto;
using Kemak.Application.DTOs.Mayorista;
using Kemak.Application.DTOs.ToldoDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Kemak.Infrastructure.Repositories;

public class MayoristaRepository : IMayoristaRepository
{
    private readonly KemakDbContext _context;
    private readonly IDistributedCache _cache;
    private const string CacheKeyPrefix = "mayo_";
    private const string AllMayoCacheKey = "mayo_all";

    public MayoristaRepository(KemakDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // 1. Obtener todos con imágenes (Espejo de Licorería)
    public async Task<IEnumerable<ProductoMayoristaDTO>> GetAllAsync()
    {
        try
        {
            var cachedData = await _cache.GetStringAsync(AllMayoCacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<IEnumerable<ProductoMayoristaDTO>>(cachedData)
                       ?? new List<ProductoMayoristaDTO>();
            }
        }
        catch { }

        var productosBase = await _context.ProductoMayorista
            .Where(p => p.Activo == 1)
            .ToListAsync();

        // ✅ FILTRO CLAVE: Debe ser "PRODUCTO_MAYORISTA" para que SQL no lo rechace
        var imagenesMayo = await _context.Imagens
            .Where(i => i.TipoEntidad == "PRODUCTO_MAYORISTA")
            .OrderBy(i => i.Orden)
            .ToListAsync();

        var resultado = productosBase.Select(p => new ProductoMayoristaDTO
        {
            IdProducto = p.IdProducto,
            Nombre = p.Nombre,
            Marca = p.Marca,
            Presentacion = p.Presentacion ?? "",
            Precio = p.Precio,
            Stock = p.Stock,
            Imagenes = imagenesMayo
                .Where(i => i.IdEntidad == p.IdProducto)
                .Select(i => new ImagenReadDto
                {
                    IdImagen = i.IdImagen,
                    Url = i.Url,
                    Descripcion = i.Descripcion,
                    Orden = i.Orden ?? 0
                }).ToList()
        }).ToList();

        try
        {
            await _cache.SetStringAsync(AllMayoCacheKey, JsonSerializer.Serialize(resultado),
                new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(30)));
        }
        catch { }

        return resultado;
    }

    // 2. Detalle con Imágenes (Espejo de Licorería)
    public async Task<ProductoMayoristaDTO?> GetDetalleAsync(int id)
    {
        string cacheKey = $"{CacheKeyPrefix}{id}";
        try
        {
            var cached = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cached)) return JsonSerializer.Deserialize<ProductoMayoristaDTO>(cached);
        }
        catch { }

        var p = await _context.ProductoMayorista
            .FirstOrDefaultAsync(p => p.IdProducto == id && p.Activo == 1);

        if (p == null) return null;

        var imagenes = await _context.Imagens
            .Where(i => i.TipoEntidad == "PRODUCTO_MAYORISTA" && i.IdEntidad == id)
            .OrderBy(i => i.Orden)
            .Select(i => new ImagenReadDto
            {
                IdImagen = i.IdImagen,
                Url = i.Url,
                Descripcion = i.Descripcion,
                Orden = i.Orden ?? 0
            }).ToListAsync();

        var dto = new ProductoMayoristaDTO
        {
            IdProducto = p.IdProducto,
            Nombre = p.Nombre,
            Marca = p.Marca,
            Presentacion = p.Presentacion ?? "",
            Precio = p.Precio,
            Stock = p.Stock,
            Imagenes = imagenes
        };

        try
        {
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto),
                new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(60)));
        }
        catch { }

        return dto;
    }

    public async Task<ProductoMayoristum?> GetByIdAsync(int id)
        => await _context.ProductoMayorista.FirstOrDefaultAsync(p => p.IdProducto == id && p.Activo == 1);

    public async Task CreateAsync(ProductoMayoristum producto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            producto.Activo = 1;
            await _context.ProductoMayorista.AddAsync(producto);
            await _context.SaveChangesAsync();

            // ✅ TIPO_ITEM debe ser "MAYORISTA" según tu constraint de BD
            var nuevoItem = new ItemVentum { TipoItem = "MAYORISTA" };
            await _context.ItemVenta.AddAsync(nuevoItem);
            await _context.SaveChangesAsync();

            var itemMayo = new ItemProductoMayoristum
            {
                IdItem = nuevoItem.IdItem,
                IdProducto = producto.IdProducto
            };
            await _context.ItemProductoMayorista.AddAsync(itemMayo);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            await _cache.RemoveAsync(AllMayoCacheKey);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateAsync(ProductoMayoristum producto)
    {
        _context.ProductoMayorista.Update(producto);
        await _context.SaveChangesAsync();
        await _cache.RemoveAsync($"{CacheKeyPrefix}{producto.IdProducto}");
        await _cache.RemoveAsync(AllMayoCacheKey);
    }

    public async Task DeleteAsync(int id)
    {
        var p = await GetByIdAsync(id);
        if (p != null)
        {
            p.Activo = 0;
            await _context.SaveChangesAsync();
            await _cache.RemoveAsync($"{CacheKeyPrefix}{id}");
            await _cache.RemoveAsync(AllMayoCacheKey);
        }
    }
}