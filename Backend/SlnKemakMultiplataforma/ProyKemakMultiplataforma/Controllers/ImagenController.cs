using Kemak.Application.DTOs.ImagenDto;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagenController : ControllerBase
    {
        private readonly IImagenRepository _imagenRepo;
        private readonly ICloudinaryService _cloudinaryService;

        public ImagenController(IImagenRepository imagenRepo, ICloudinaryService cloudinaryService)
        {
            _imagenRepo = imagenRepo;
            _cloudinaryService = cloudinaryService;
        }

        // ==========================================================
        // POST: /api/Imagen/upload (Subida física a Cloudinary)
        // ==========================================================
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
        public async Task<IActionResult> Upload([FromForm] ImagenCreateDto dto)
        {
            // 1. Validar archivo
            if (dto.Archivo == null || dto.Archivo.Length == 0)
                return BadRequest("Debe seleccionar una imagen válida.");

            // 2. Validar Tipo de Entidad (Regla de negocio Kemak)
            var tipoUpper = dto.TipoEntidad.ToUpper();
            if (tipoUpper != "TOLDO" && tipoUpper != "PRODUCTO_LICORERIA" && tipoUpper != "PRODUCTO_MAYORISTA")
            {
                return BadRequest("Tipo de entidad inválido. Use: Toldo, Producto_Licoreria o Producto_Mayorista");
            }

            // 3. Subida física a la nube
            var uploadResult = await _cloudinaryService.UploadImageAsync(dto.Archivo);

            if (string.IsNullOrEmpty(uploadResult.Url))
                return BadRequest("Error al procesar la imagen en Cloudinary.");

            // 4. Guardar en PostgreSQL
            var nuevaImagen = new Imagen
            {
                TipoEntidad = tipoUpper,
                IdEntidad = dto.IdEntidad,
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId,
                Descripcion = dto.Descripcion,
                Orden = dto.Orden
            };

            await _imagenRepo.CreateAsync(nuevaImagen);

            return Ok(new
            {
                mensaje = "Imagen cargada con éxito",
                url = uploadResult.Url,
                id = nuevaImagen.IdImagen
            });
        }

        // ==========================================================
        // GET: /api/Imagen/{tipo}/{idEntidad} (Público para Landing)
        // ==========================================================
        [HttpGet("{tipo}/{idEntidad}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByEntidad(string tipo, int idEntidad)
        {
            var tipoUpper = tipo.ToUpper();
            var imagenes = await _imagenRepo.GetByEntidadAsync(tipoUpper, idEntidad);

            if (!imagenes.Any())
                return NotFound($"No hay imágenes para {tipoUpper} con ID {idEntidad}.");

            return Ok(imagenes);
        }
        // ==========================================================
        // GET: /api/Imagen/{id}
        // Obtener una imagen específica por su ID único
        // ==========================================================
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var imagen = await _imagenRepo.GetByIdAsync(id);

            if (imagen == null)
            {
                return NotFound(new { mensaje = $"Imagen con ID {id} no encontrada." });
            }

            // Retornamos el objeto tal cual o podrías usar un DTO si no quieres exponer todo
            return Ok(imagen);
        }
        // ==========================================================
        // PUT: /api/Imagen/{id} (Actualizar solo metadatos)
        // ==========================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
        public async Task<IActionResult> Update(int id, [FromBody] ImagenUpdateDto dto)
        {
            var existente = await _imagenRepo.GetByIdAsync(id);
            if (existente == null) return NotFound("Imagen no encontrada.");

            // Solo permitimos editar descripción y orden para no romper la URL de Cloudinary
            existente.Descripcion = dto.Descripcion;
            existente.Orden = dto.Orden;

            await _imagenRepo.UpdateAsync(existente);
            return Ok(new { mensaje = "Metadatos de imagen actualizados." });
        }

        // ==========================================================
        // DELETE: /api/Imagen/{id} (Borrado lógico/físico)
        // ==========================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existente = await _imagenRepo.GetByIdAsync(id);
            if (existente == null) return NotFound("La imagen no existe.");

            // 1. ELIMINACIÓN FÍSICA EN CLOUDINARY
            if (!string.IsNullOrEmpty(existente.PublicId))
            {
                await _cloudinaryService.DeleteImageAsync(existente.PublicId);
            }

            // 2. ELIMINACIÓN EN BASE DE DATOS
            var eliminado = await _imagenRepo.DeleteAsync(id);

            return eliminado ? NoContent() : StatusCode(500, "Error al eliminar.");
        }
    }
}