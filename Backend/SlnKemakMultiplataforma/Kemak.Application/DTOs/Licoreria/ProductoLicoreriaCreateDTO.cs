using System.ComponentModel.DataAnnotations;

namespace Kemak.Application.DTOs.Licoreria
{
    public class ProductoLicoreriaCreateDTO
    {
        [Required(ErrorMessage = "El nombre del producto es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = null!;

        [StringLength(50, ErrorMessage = "La marca no puede exceder los 50 caracteres")]
        public string? Marca { get; set; }

        [StringLength(50, ErrorMessage = "La categoría no puede exceder los 50 caracteres")]
        public string? Categoria { get; set; }

        [Required(ErrorMessage = "El precio es obligatorio")]
        [Range(0.01, 10000.00, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "El stock inicial es obligatorio")]
        [Range(0, 5000, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }
    }
}