using Kemak.Application.DTOs.ToldoDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.Licoreria
{
    public class ProductoLicoreriaDTO
    {
        public int IdProducto { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Marca { get; set; }
        public string? Categoria { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public List<ImagenReadDto> Imagenes { get; set; } = new();
    }
}
