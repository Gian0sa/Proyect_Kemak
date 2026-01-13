using Kemak.Application.DTOs.VentaDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentaController : ControllerBase
{
    private readonly IVentaRepository _ventaRepository;

    public VentaController(IVentaRepository ventaRepository)
    {
        _ventaRepository = ventaRepository;
    }
    [HttpGet("resumen-ingresos")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetResumenIngresos()
    {
        var ventas = await _ventaRepository.GetAllVentasAsync();

        var resumen = new
        {
            TotalRecaudado = ventas.Sum(v => v.Total),
            VentasLicoreria = ventas.Where(v => v.TipoVenta == "LICORERIA").Sum(v => v.Total),
            VentasMayorista = ventas.Where(v => v.TipoVenta == "MAYORISTA").Sum(v => v.Total),
            AlquilerToldos = ventas.Where(v => v.TipoVenta == "TOLDO").Sum(v => v.Total),
            CantidadOperaciones = ventas.Count()
        };

        return Ok(resumen);
    }
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> Post([FromBody] VentaCreateDTO dto)
    {
        if (dto.Detalles == null || !dto.Detalles.Any())
            return BadRequest("La venta no tiene detalles.");

        try
        {
            var nuevaVenta = new Ventum
            {
                IdCliente = dto.IdCliente,
                IdUsuario = dto.IdUsuario,
                Fecha = DateTime.Now,
                TipoVenta = dto.TipoVenta.ToUpper(),
                Observaciones = dto.Observaciones,
                Total = dto.Detalles.Sum(d => d.PrecioUnitario * d.Cantidad)
            };

            var detallesEntidad = dto.Detalles.Select(d => new DetalleVentum
            {
                IdItem = d.IdItem,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario
            }).ToList();

            AlquilerToldo? alquiler = null;
            if (nuevaVenta.TipoVenta == "TOLDO")
            {
                if (!dto.FechaInicio.HasValue || !dto.FechaFin.HasValue)
                    return BadRequest("Fechas obligatorias para alquiler.");

                alquiler = new AlquilerToldo
                {
                    // Conversión de tipos para PostgreSQL
                    FechaInicio = DateOnly.FromDateTime(dto.FechaInicio.Value),
                    FechaFin = DateOnly.FromDateTime(dto.FechaFin.Value),
                    Estado = "ACTIVO"
                };
            }

            var resultado = await _ventaRepository.RegistrarVentaAsync(nuevaVenta, detallesEntidad, alquiler);

            return CreatedAtAction(nameof(GetById), new { id = resultado.IdVenta }, new
            {
                idVenta = resultado.IdVenta,
                mensaje = "Transacción completada con éxito."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> GetAll()
    {
        var ventas = await _ventaRepository.GetAllVentasAsync();
        return Ok(ventas);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> GetById(int id)
    {
        var venta = await _ventaRepository.GetVentaByIdAsync(id);
        if (venta == null) return NotFound();
        return Ok(venta);
    }
    [HttpPatch("registrar-devolucion")]
    [Authorize(Roles = "Admin,Vendedor_Toldos")]
    public async Task<IActionResult> RegistrarDevolucion([FromBody] DevolucionToldoDTO dto)
    {
        try
        {
            // Llamamos al repositorio para actualizar las 3 cosas: fecha, estado y obs
            await _ventaRepository.RegistrarDevolucionAsync(dto.IdAlquiler, dto.Observaciones, dto.Estado);

            return Ok(new { mensaje = $"Alquiler {dto.IdAlquiler} marcado como {dto.Estado} correctamente." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al registrar devolución: {ex.Message}");
        }
    }
}