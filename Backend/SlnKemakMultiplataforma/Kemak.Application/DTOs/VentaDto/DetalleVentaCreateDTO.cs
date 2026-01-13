using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.VentaDto
{
    public class DetalleVentaCreateDTO
    {
        public int IdItem { get; set; } // El ID que ves en tu tabla image_d38604.png
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}
