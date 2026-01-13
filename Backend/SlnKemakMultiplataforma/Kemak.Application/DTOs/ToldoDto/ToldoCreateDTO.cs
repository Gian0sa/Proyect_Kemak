using System.ComponentModel.DataAnnotations;

namespace Kemak.Application.DTOs.ToldoDto
{
    public class ToldoCreateDTO
    {
        [Required(ErrorMessage = "El nombre del modelo es obligatorio")]
        [StringLength(100, ErrorMessage = "El modelo no puede exceder los 100 caracteres")]
        public string Modelo { get; set; } = null!;

        [StringLength(150, ErrorMessage = "La descripción no puede exceder los 150 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "El precio de alquiler es obligatorio")]
        [Range(0.01, 5000.00, ErrorMessage = "El precio de alquiler debe ser mayor a 0")]
        public decimal PrecioAlquiler { get; set; }
    }
}