using Kemak.Application.DTOs.ToldoDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Microsoft.AspNetCore.Authorization; // Agregado para seguridad
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Por defecto requiere token para todo
public class ToldoController : ControllerBase
{
    private readonly IToldoRepository _repository;

    public ToldoController(IToldoRepository repository) => _repository = repository;

    // GET: api/Toldo
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        
        var dtos = await _repository.GetAllAsync();
        return Ok(dtos);
    }

    // GET: api/Toldo/5
    [HttpGet("{id}")]
    [AllowAnonymous] // Público: Para que el cliente vea fotos y detalles del toldo elegido
    public async Task<IActionResult> Get(int id)
    {
        var dto = await _repository.GetToldoDetalleAsync(id);

        if (dto == null)
            return NotFound("El toldo no existe o no está activo.");

        return Ok(dto);
    }

    // POST: api/Toldo
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor_Toldos")] // Solo Admin o encargado de Toldos
    public async Task<IActionResult> Post(ToldoCreateDTO dto)
    {
        var toldo = new Toldo
        {
            Modelo = dto.Modelo,
            Descripcion = dto.Descripcion,
            PrecioAlquiler = dto.PrecioAlquiler,
            Activo = 1
        };
        await _repository.CreateAsync(toldo);

        return CreatedAtAction(nameof(Get), new { id = toldo.IdToldo }, new
        {
            idToldo = toldo.IdToldo,
            modelo = toldo.Modelo,
            mensaje = "Toldo e Items creados correctamente"
        });
    }

    // PUT: api/Toldo/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Vendedor_Toldos")] // Protegido contra vendedores de otras áreas
    public async Task<IActionResult> Put(int id, ToldoCreateDTO dto)
    {
        var toldoExistente = await _repository.GetByIdAsync(id);
        if (toldoExistente == null) return NotFound();

        toldoExistente.Modelo = dto.Modelo;
        toldoExistente.Descripcion = dto.Descripcion;
        toldoExistente.PrecioAlquiler = dto.PrecioAlquiler;

        await _repository.UpdateAsync(toldoExistente);
        return NoContent();
    }

    // DELETE: api/Toldo/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // Solo el Admin puede eliminar toldos del sistema
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }

    // GET: api/Toldo/disponibilidad
    [HttpGet("disponibilidad")]
    [Authorize(Roles = "Admin,Vendedor_Toldos")] // Información interna operativa
    public async Task<IActionResult> GetDisponibilidad()
    {
        return Ok(await _repository.GetDisponibilidadAsync());
    }
}