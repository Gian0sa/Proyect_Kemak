using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Kemak.Infrastructure.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly KemakDbContext _context;
    private readonly IDistributedCache _cache;

    // ✅ CORREGIDO: Llaves exactas que usan los otros repositorios
    private const string LicoreriaCacheKey = "licor_all_v3";
    private const string MayoristaCacheKey = "mayo_all";
    private const string ToldosCacheKey = "toldo_all_v3";

    public VentaRepository(KemakDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Ventum> RegistrarVentaAsync(Ventum venta, List<DetalleVentum> detalles, AlquilerToldo? alquiler = null)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Registrar venta
            await _context.Venta.AddAsync(venta);
            await _context.SaveChangesAsync();

            // 2. Procesar detalles y actualizar stock
            foreach (var detalle in detalles)
            {
                int idItemReal = await ObtenerIdItemDesdeProducto(detalle.IdItem, venta.TipoVenta);
                detalle.IdVenta = venta.IdVenta;
                detalle.IdItem = idItemReal;
                await _context.DetalleVenta.AddAsync(detalle);

                if (venta.TipoVenta != "TOLDO")
                {
                    await ActualizarStock(idItemReal, detalle.Cantidad, venta.TipoVenta);
                }
            }

            // 3. Registrar alquiler si es toldo
            if (alquiler != null && venta.TipoVenta == "TOLDO")
            {
                alquiler.IdVenta = venta.IdVenta;
                alquiler.IdToldo = detalles.First().IdItem;
                await _context.AlquilerToldos.AddAsync(alquiler);
            }

            // 4. Commit de la transacción
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // ✅ 5. INVALIDACIÓN DE CACHÉ: Limpiar TODAS las llaves relacionadas
            try
            {
                if (venta.TipoVenta == "LICORERIA")
                {
                    await _cache.RemoveAsync(LicoreriaCacheKey);
                    // Limpiar también cachés individuales si existen
                    foreach (var detalle in detalles)
                    {
                        await _cache.RemoveAsync($"licor_{detalle.IdItem}");
                    }
                }
                else if (venta.TipoVenta == "MAYORISTA")
                {
                    await _cache.RemoveAsync(MayoristaCacheKey);
                    foreach (var detalle in detalles)
                    {
                        await _cache.RemoveAsync($"mayo_{detalle.IdItem}");
                    }
                }
                else if (venta.TipoVenta == "TOLDO")
                {
                    await _cache.RemoveAsync(ToldosCacheKey);
                    foreach (var detalle in detalles)
                    {
                        await _cache.RemoveAsync($"toldo_{detalle.IdItem}");
                    }
                }
            }
            catch (Exception cacheEx)
            {
                // Log pero no fallar la venta si Redis tiene problemas
                Console.WriteLine($"Error limpiando caché: {cacheEx.Message}");
            }

            return venta;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"Error al registrar venta: {ex.Message}", ex);
        }
    }

    private async Task<int> ObtenerIdItemDesdeProducto(int idProducto, string tipo)
    {
        if (tipo == "LICORERIA")
        {
            var vinculo = await _context.ItemProductoLicoreria
                .FirstOrDefaultAsync(v => v.IdProducto == idProducto);
            return vinculo?.IdItem ?? throw new Exception($"Producto {idProducto} no vinculado a Licorería.");
        }
        else if (tipo == "MAYORISTA")
        {
            var vinculo = await _context.ItemProductoMayorista
                .FirstOrDefaultAsync(v => v.IdProducto == idProducto);
            return vinculo?.IdItem ?? throw new Exception($"Producto {idProducto} no vinculado a Mayorista.");
        }
        return idProducto;
    }

    private async Task ActualizarStock(int idItem, int cantidad, string tipo)
    {
        if (tipo == "LICORERIA")
        {
            var itemLicor = await _context.ItemProductoLicoreria
                .Include(i => i.IdProductoNavigation)
                .FirstOrDefaultAsync(i => i.IdItem == idItem);

            if (itemLicor == null)
                throw new Exception($"Item {idItem} no existe en inventario Licorería.");

            if (itemLicor.IdProductoNavigation.Stock < cantidad)
                throw new Exception($"Stock insuficiente. Disponible: {itemLicor.IdProductoNavigation.Stock}");

            itemLicor.IdProductoNavigation.Stock -= cantidad;
        }
        else if (tipo == "MAYORISTA")
        {
            var itemMayo = await _context.ItemProductoMayorista
                .Include(i => i.IdProductoNavigation)
                .FirstOrDefaultAsync(i => i.IdItem == idItem);

            if (itemMayo == null)
                throw new Exception($"Item {idItem} no existe en inventario Mayorista.");

            if (itemMayo.IdProductoNavigation.Stock < cantidad)
                throw new Exception($"Stock insuficiente. Disponible: {itemMayo.IdProductoNavigation.Stock}");

            itemMayo.IdProductoNavigation.Stock -= cantidad;
        }
    }

    public async Task RegistrarDevolucionAsync(int idAlquiler, string? observaciones, string estado)
    {
        var alquiler = await _context.AlquilerToldos.FindAsync(idAlquiler);
        if (alquiler == null)
            throw new Exception("Alquiler no encontrado.");

        alquiler.FechaDevolucion = DateOnly.FromDateTime(DateTime.Now);
        alquiler.Estado = estado.ToUpper();
        alquiler.Observaciones = observaciones;

        await _context.SaveChangesAsync();

        // Limpiar caché de toldos
        try
        {
            await _cache.RemoveAsync(ToldosCacheKey);
            await _cache.RemoveAsync($"toldo_{alquiler.IdToldo}");
        }
        catch { }
    }

    public async Task<IEnumerable<Ventum>> GetAllVentasAsync()
        => await _context.Venta
            .Include(v => v.IdClienteNavigation)
            .OrderByDescending(v => v.Fecha)
            .ToListAsync();

    public async Task<Ventum?> GetVentaByIdAsync(int id)
        => await _context.Venta
            .Include(v => v.DetalleVenta)
            .Include(v => v.IdClienteNavigation)
            .FirstOrDefaultAsync(v => v.IdVenta == id);
}