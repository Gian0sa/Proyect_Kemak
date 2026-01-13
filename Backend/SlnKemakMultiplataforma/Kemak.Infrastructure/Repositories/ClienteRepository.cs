using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace Kemak.Infrastructure.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly KemakDbContext _context;
    private readonly IDistributedCache _cache;
    private const string CacheKeyPrefix = "cli_";

    public ClienteRepository(KemakDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<IEnumerable<Cliente>> GetAllAsync()
        => await _context.Clientes.Where(c => c.Activo == 1).ToListAsync();

    public async Task<Cliente?> GetByIdAsync(int id)
        => await _context.Clientes.FirstOrDefaultAsync(c => c.IdCliente == id && c.Activo == 1);

    // Búsqueda por DNI con Caché
    public async Task<Cliente?> GetByDniAsync(string dni)
    {
        string cacheKey = $"{CacheKeyPrefix}{dni}";
        try
        {
            var cached = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cached)) return JsonSerializer.Deserialize<Cliente>(cached);
        }
        catch { }

        var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Dni == dni && c.Activo == 1);

        if (cliente != null)
        {
            try
            {
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(cliente),
                    new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(60)));
            }
            catch { }
        }
        return cliente;
    }

    public async Task CreateAsync(Cliente cliente)
    {
        cliente.Activo = 1;
        await _context.Clientes.AddAsync(cliente);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Cliente cliente)
    {
        _context.Clientes.Update(cliente);
        await _context.SaveChangesAsync();
        // Limpiamos caché por DNI si los datos cambiaron
        if (!string.IsNullOrEmpty(cliente.Dni))
            await _cache.RemoveAsync($"{CacheKeyPrefix}{cliente.Dni}");
    }

    public async Task DeleteAsync(int id)
    {
        var cliente = await GetByIdAsync(id);
        if (cliente != null)
        {
            cliente.Activo = 0; // Borrado lógico
            await _context.SaveChangesAsync();
            if (!string.IsNullOrEmpty(cliente.Dni))
                await _cache.RemoveAsync($"{CacheKeyPrefix}{cliente.Dni}");
        }
    }
}