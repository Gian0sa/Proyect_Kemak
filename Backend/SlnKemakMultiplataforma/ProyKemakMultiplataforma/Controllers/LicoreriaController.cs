using Kemak.Application.DTOs.Licoreria;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LicoreriaController : ControllerBase
{
    private readonly ILicoreriaRepository _repository;

    public LicoreriaController(ILicoreriaRepository repository)
    {
        _repository = repository;
    }

    // GET: api/Licoreria
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var licores = await _repository.ObtenerTodosAsync();
        return Ok(licores);
    }

    // GET: api/Licoreria/5
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var dto = await _repository.ObtenerDetalleAsync(id);
        if (dto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });
        return Ok(dto);
    }

    // POST: api/Licoreria
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor_Licoreria")]
    public async Task<IActionResult> Post(ProductoLicoreriaCreateDTO dto)
    {
        var producto = new ProductoLicorerium
        {
            Nombre = dto.Nombre,
            Marca = dto.Marca,
            Categoria = dto.Categoria,
            Precio = dto.Precio,
            Stock = dto.Stock,
            Activo = 1
        };

        await _repository.CrearAsync(producto);

        return CreatedAtAction(nameof(GetById), new { id = producto.IdProducto }, new
        {
            idProducto = producto.IdProducto,
            nombre = producto.Nombre,
            marca = producto.Marca,
            categoria = producto.Categoria,
            precio = producto.Precio,
            stock = producto.Stock,
            mensaje = "Producto creado con éxito"
        });
    }

    // ✅ PUT CORREGIDO: Igual que Mayorista
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria")]
    public async Task<IActionResult> Update(int id, ProductoLicoreriaDTO dto)
    {
        var existente = await _repository.ObtenerPorIdAsync(id);
        if (existente == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        existente.Nombre = dto.Nombre;
        existente.Marca = dto.Marca;
        existente.Categoria = dto.Categoria;
        existente.Precio = dto.Precio;
        existente.Stock = dto.Stock;

        var result = await _repository.ActualizarAsync(existente);

        if (!result)
            return BadRequest(new { mensaje = "Error al actualizar" });

        // ✅ DEVOLVER EL OBJETO CON ID (igual que Mayorista)
        return Ok(new
        {
            idProducto = existente.IdProducto,
            nombre = existente.Nombre,
            marca = existente.Marca,
            categoria = existente.Categoria,
            precio = existente.Precio,
            stock = existente.Stock,
            mensaje = "Producto actualizado con éxito"
        });
    }

    // DELETE: api/Licoreria/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _repository.ObtenerPorIdAsync(id);
        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        var result = await _repository.EliminarAsync(id);

        return result
            ? Ok(new { mensaje = "Producto eliminado con éxito" })
            : BadRequest(new { mensaje = "Error al eliminar" });
    }
}