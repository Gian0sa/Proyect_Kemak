using System.ComponentModel.DataAnnotations;

namespace Kemak.Application.DTOs.Mayorista
{
    public class ProductoMayoristaCreateDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = null!;

        [Required(ErrorMessage = "La presentación (ej. Saco, Caja) es obligatoria")]
        public string Presentacion { get; set; } = null!;

        [Required(ErrorMessage = "El precio es obligatorio")]
        [Range(0.01, 50000.00, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "El stock es obligatorio")]
        [Range(0, 10000, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }

        public string? Marca { get; set; }
        public string? Categoria { get; set; }
    }
}