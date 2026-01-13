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

    // REGISTRO DE VENTA: Maneja Licorería, Mayorista y Toldos en una sola transacción
    public async Task<Ventum> RegistrarVentaAsync(Ventum venta, List<DetalleVentum> detalles, AlquilerToldo? alquiler = null)
    {
        // Iniciamos transacción para asegurar que no haya datos huérfanos si algo falla
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Guardar Cabecera de Venta
            await _context.Venta.AddAsync(venta);
            await _context.SaveChangesAsync();

            // 2. Procesar Detalles y Actualizar Stock
            foreach (var detalle in detalles)
            {
                detalle.IdVenta = venta.IdVenta;
                await _context.DetalleVenta.AddAsync(detalle);

                // Solo descontamos stock si no es un servicio de Toldo
                if (venta.TipoVenta != "TOLDO")
                {
                    await ActualizarStock(detalle.IdItem, detalle.Cantidad);
                }
            }

            // 3. Lógica específica para Alquiler de Toldos
            if (alquiler != null && venta.TipoVenta == "TOLDO")
            {
                // Buscamos el IdToldo real a través del IdItem enviado
                int idItemVenta = detalles.First().IdItem;
                var vinculoToldo = await _context.ItemToldos
                    .FirstOrDefaultAsync(it => it.IdItem == idItemVenta);

                if (vinculoToldo == null)
                    throw new Exception("Error técnico: El ítem seleccionado no está vinculado a ningún toldo físico.");

                alquiler.IdVenta = venta.IdVenta;
                alquiler.IdToldo = vinculoToldo.IdToldo;

                await _context.AlquilerToldos.AddAsync(alquiler);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return venta;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // MÉTODO PRIVADO: Gestiona el stock dinámicamente entre tablas
    private async Task ActualizarStock(int idItem, int cantidadAVender)
    {
        // Buscar en Licorería
        var itemLicor = await _context.ItemProductoLicoreria
            .Include(i => i.IdProductoNavigation)
            .FirstOrDefaultAsync(i => i.IdItem == idItem);

        if (itemLicor != null)
        {
            if (itemLicor.IdProductoNavigation.Stock < cantidadAVender)
                throw new Exception($"Stock insuficiente: Solo quedan {itemLicor.IdProductoNavigation.Stock} unidades de {itemLicor.IdProductoNavigation.Nombre}");

            itemLicor.IdProductoNavigation.Stock -= cantidadAVender;
            return;
        }

        // Buscar en Mayorista
        var itemMayo = await _context.ItemProductoMayorista
            .Include(i => i.IdProductoNavigation)
            .FirstOrDefaultAsync(i => i.IdItem == idItem);

        if (itemMayo != null)
        {
            if (itemMayo.IdProductoNavigation.Stock < cantidadAVender)
                throw new Exception($"Stock insuficiente en Mayorista para {itemMayo.IdProductoNavigation.Nombre}");

            itemMayo.IdProductoNavigation.Stock -= cantidadAVender;
        }
    }

    // GESTIÓN DE ALQUILERES: Registrar cuando el cliente devuelve el equipo
    public async Task RegistrarDevolucionAsync(int idAlquiler, string? observaciones, string estado)
    {
        var alquiler = await _context.AlquilerToldos.FindAsync(idAlquiler);
        if (alquiler == null) throw new Exception("El registro de alquiler no existe.");

        alquiler.FechaDevolucion = DateOnly.FromDateTime(DateTime.Now);
        alquiler.Estado = estado.ToUpper();
        alquiler.Observaciones = observaciones;

        await _context.SaveChangesAsync();
    }

    // CONSULTAS PARA EL FRONTEND
    public async Task<IEnumerable<Ventum>> GetAllVentasAsync()
        => await _context.Venta.Include(v => v.IdClienteNavigation).OrderByDescending(v => v.Fecha).ToListAsync();

    public async Task<Ventum?> GetVentaByIdAsync(int id)
        => await _context.Venta.Include(v => v.DetalleVenta).FirstOrDefaultAsync(v => v.IdVenta == id);

    // REPORTE MAESTRO: Usa la vista de PostgreSQL para rapidez total en React
    public async Task<IEnumerable<VwVentasCompleta>> GetReporteCompletoAsync()
    {
        return await _context.VwVentasCompletas
            .OrderByDescending(v => v.Fecha)
            .ToListAsync();
    }
}