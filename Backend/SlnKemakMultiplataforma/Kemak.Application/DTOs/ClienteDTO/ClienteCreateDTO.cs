using System.ComponentModel.DataAnnotations;

namespace Kemak.Application.DTOs.ClienteDTO
{
    public class ClienteCreateDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres")]
        public string Nombre { get; set; } = null!;

        [Required(ErrorMessage = "El DNI es obligatorio")]
        [RegularExpression(@"^\d{8,12}$", ErrorMessage = "El DNI debe ser numérico y tener entre 8 y 12 dígitos")]
        public string? Dni { get; set; }

        [Phone(ErrorMessage = "Formato de teléfono no válido")]
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder los 15 caracteres")]
        public string? Telefono { get; set; }

        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        public string? Email { get; set; }

        [StringLength(200, ErrorMessage = "La dirección es demasiado larga")]
        public string? Direccion { get; set; }
    }
}