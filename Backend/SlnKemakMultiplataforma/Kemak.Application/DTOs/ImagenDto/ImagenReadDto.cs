namespace Kemak.Application.DTOs.ToldoDto
{
    public class ImagenReadDto
    {
        public int IdImagen { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int Orden { get; set; } // Importante para saber cuál es la foto de portada
    }
}