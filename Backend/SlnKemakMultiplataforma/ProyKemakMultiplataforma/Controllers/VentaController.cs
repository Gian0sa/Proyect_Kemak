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
                    FechaInicio = DateOnly.FromDateTime(dto.FechaInicio.Value),
                    FechaFin = DateOnly.FromDateTime(dto.FechaFin.Value),
                    Estado = "ACTIVO"
                };
            }

            // Aquí sucede la magia: guarda en PostgreSQL y limpia Redis automáticamente
            var resultado = await _ventaRepository.RegistrarVentaAsync(nuevaVenta, detallesEntidad, alquiler);

            return CreatedAtAction(nameof(GetById), new { id = resultado.IdVenta }, new
            {
                idVenta = resultado.IdVenta,
                mensaje = "Transacción completada y stock actualizado en tiempo real."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
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

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _ventaRepository.GetAllVentasAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var venta = await _ventaRepository.GetVentaByIdAsync(id);
        return venta == null ? NotFound() : Ok(venta);
    }

    [HttpPatch("registrar-devolucion")]
    [Authorize(Roles = "Admin,Vendedor_Toldos")]
    public async Task<IActionResult> RegistrarDevolucion([FromBody] DevolucionToldoDTO dto)
    {
        try
        {
            await _ventaRepository.RegistrarDevolucionAsync(dto.IdAlquiler, dto.Observaciones, dto.Estado);
            return Ok(new { mensaje = "Devolución registrada." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }
}