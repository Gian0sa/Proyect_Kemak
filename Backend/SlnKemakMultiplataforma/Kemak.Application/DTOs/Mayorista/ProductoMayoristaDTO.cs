using Kemak.Application.DTOs.ToldoDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.Mayorista
{
    public class ProductoMayoristaDTO
    {
        public int IdProducto { get; set; }
        public string Nombre { get; set; } = null!;
        public string Marca { get; set; } = null!;
        public string Presentacion { get; set; } = null!; // Ej: "Caja x 12"
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public List<ImagenReadDto> Imagenes { get; set; } = new();
    }
}
