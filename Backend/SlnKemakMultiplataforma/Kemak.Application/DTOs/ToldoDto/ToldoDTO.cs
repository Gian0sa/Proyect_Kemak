using Kemak.Application.DTOs.ImagenDto;

namespace Kemak.Application.DTOs.ToldoDto
{
    public class ToldoDTO
    {
        public int IdToldo { get; set; }
        public string Modelo { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal PrecioAlquiler { get; set; }
        public List<ImagenReadDto> Imagenes { get; set; } = new();
    }
}
