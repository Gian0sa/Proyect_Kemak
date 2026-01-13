using Kemak.Application.DTOs.Mayorista;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MayoristaController : ControllerBase
    {
        private readonly IMayoristaRepository _repository;

        public MayoristaController(IMayoristaRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Mayorista
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
            var productos = await _repository.GetAllAsync();
            return Ok(productos);
        }

        // GET: api/Mayorista/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var dto = await _repository.GetDetalleAsync(id);
            if (dto == null)
                return NotFound(new { mensaje = "El producto mayorista no existe o no está activo." });
            return Ok(dto);
        }

        // POST: api/Mayorista
        [HttpPost]
        [Authorize(Roles = "Admin,Vendedor_Mayorista")]
        public async Task<IActionResult> Post(ProductoMayoristaCreateDTO dto)
        {
            var producto = new ProductoMayoristum
            {
                Nombre = dto.Nombre,
                Marca = dto.Marca,
                Categoria = dto.Categoria,
                Presentacion = dto.Presentacion,
                Precio = dto.Precio,
                Stock = dto.Stock,
                Activo = 1
            };

            await _repository.CreateAsync(producto);

            return CreatedAtAction(nameof(Get), new { id = producto.IdProducto }, new
            {
                idProducto = producto.IdProducto,
                nombre = producto.Nombre,
                marca = producto.Marca,
                presentacion = producto.Presentacion,
                precio = producto.Precio,
                stock = producto.Stock,
                mensaje = "Producto mayorista creado con éxito"
            });
        }

        // PUT: api/Mayorista/5 - ✅ CORREGIDO: Devuelve el objeto actualizado
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Vendedor_Mayorista")]
        public async Task<IActionResult> Put(int id, ProductoMayoristaCreateDTO dto)
        {
            var productoExistente = await _repository.GetByIdAsync(id);
            if (productoExistente == null)
                return NotFound(new { mensaje = "Producto no encontrado" });

            productoExistente.Nombre = dto.Nombre;
            productoExistente.Marca = dto.Marca;
            productoExistente.Categoria = dto.Categoria;
            productoExistente.Presentacion = dto.Presentacion;
            productoExistente.Precio = dto.Precio;
            productoExistente.Stock = dto.Stock;

            await _repository.UpdateAsync(productoExistente);

            // ✅ DEVOLVER EL OBJETO ACTUALIZADO para que el frontend obtenga el ID
            return Ok(new
            {
                idProducto = productoExistente.IdProducto,
                nombre = productoExistente.Nombre,
                marca = productoExistente.Marca,
                presentacion = productoExistente.Presentacion,
                precio = productoExistente.Precio,
                stock = productoExistente.Stock,
                mensaje = "Producto actualizado con éxito"
            });
        }

        // DELETE: api/Mayorista/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var producto = await _repository.GetByIdAsync(id);
            if (producto == null)
                return NotFound(new { mensaje = "Producto no encontrado" });

            await _repository.DeleteAsync(id);
            return Ok(new { mensaje = "Producto eliminado con éxito" });
        }
    }
}