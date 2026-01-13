using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
namespace Kemak.Application.DTOs.ImagenDto;

public class ImagenCreateDto
{
    [Required(ErrorMessage = "El tipo de entidad es obligatorio (Toldo, Mayorista, etc.).")]
    [StringLength(20)]
    public string TipoEntidad { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe especificar el ID de la entidad a la que pertenece.")]
    public int IdEntidad { get; set; }

    [Required]
    public IFormFile Archivo { get; set; } = null!;

    public string? Descripcion { get; set; }

    public int Orden { get; set; } = 0; // Para decidir qué foto va primero
}