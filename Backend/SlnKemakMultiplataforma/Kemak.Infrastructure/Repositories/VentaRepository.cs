using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kemak.Infrastructure.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly KemakDbContext _context;

    public VentaRepository(KemakDbContext context)
    {
        _context = context;
    }

    public async Task<Ventum> RegistrarVentaAsync(Ventum venta, List<DetalleVentum> detalles, AlquilerToldo? alquiler = null)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.Venta.AddAsync(venta);
            await _context.SaveChangesAsync();

            foreach (var detalle in detalles)
            {
                // 🌉 LÓGICA DE PUENTE: Buscamos el ID_ITEM real de PostgreSQL
                int idItemReal = await ObtenerIdItemDesdeProducto(detalle.IdItem, venta.TipoVenta);

                detalle.IdVenta = venta.IdVenta;
                detalle.IdItem = idItemReal; // Reemplazamos por el ID que PostgreSQL acepta
                await _context.DetalleVenta.AddAsync(detalle);

                if (venta.TipoVenta != "TOLDO")
                {
                    await ActualizarStock(idItemReal, detalle.Cantidad, venta.TipoVenta);
                }
            }

            if (alquiler != null && venta.TipoVenta == "TOLDO")
            {
                alquiler.IdVenta = venta.IdVenta;
                alquiler.IdToldo = detalles.First().IdItem;
                await _context.AlquilerToldos.AddAsync(alquiler);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync(); // Persistencia física confirmada
            return venta;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"Fallo en persistencia: {ex.Message}");
        }
    }

    // MÉTODO PUENTE: Traduce ID Producto a ID Item
    private async Task<int> ObtenerIdItemDesdeProducto(int idProducto, string tipo)
    {
        if (tipo == "LICORERIA")
        {
            var vinculo = await _context.ItemProductoLicoreria.FirstOrDefaultAsync(v => v.IdProducto == idProducto);
            return vinculo?.IdItem ?? throw new Exception($"El producto {idProducto} no está vinculado a la tabla ITEM_VENTA de Licorería.");
        }
        else if (tipo == "MAYORISTA")
        {
            var vinculo = await _context.ItemProductoMayorista.FirstOrDefaultAsync(v => v.IdProducto == idProducto);
            return vinculo?.IdItem ?? throw new Exception($"El producto {idProducto} no está vinculado a la tabla ITEM_VENTA de Mayorista.");
        }
        return idProducto; // Para Toldos el ID suele ser directo
    }

    private async Task ActualizarStock(int idItem, int cantidad, string tipo)
    {
        if (tipo == "LICORERIA")
        {
            var itemLicor = await _context.ItemProductoLicoreria
                .Include(i => i.IdProductoNavigation)
                .FirstOrDefaultAsync(i => i.IdItem == idItem);

            if (itemLicor == null) throw new Exception($"ID Item {idItem} no existe en inventario.");
            itemLicor.IdProductoNavigation.Stock -= cantidad;
        }
        else if (tipo == "MAYORISTA")
        {
            var itemMayo = await _context.ItemProductoMayorista
                .Include(i => i.IdProductoNavigation)
                .FirstOrDefaultAsync(i => i.IdItem == idItem);

            if (itemMayo == null) throw new Exception($"ID Item {idItem} no existe en Mayorista.");
            itemMayo.IdProductoNavigation.Stock -= cantidad;
        }
    }

    // Otros métodos (RegistrarDevolucion, GetAllVentas, etc) se mantienen igual...
    public async Task RegistrarDevolucionAsync(int idAlquiler, string? observaciones, string estado)
    {
        var alquiler = await _context.AlquilerToldos.FindAsync(idAlquiler);
        if (alquiler == null) throw new Exception("Alquiler no encontrado.");
        alquiler.FechaDevolucion = DateOnly.FromDateTime(DateTime.Now);
        alquiler.Estado = estado.ToUpper();
        alquiler.Observaciones = observaciones;
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Ventum>> GetAllVentasAsync()
        => await _context.Venta.Include(v => v.IdClienteNavigation).OrderByDescending(v => v.Fecha).ToListAsync();

    public async Task<Ventum?> GetVentaByIdAsync(int id)
        => await _context.Venta.Include(v => v.DetalleVenta).FirstOrDefaultAsync(v => v.IdVenta == id);
}