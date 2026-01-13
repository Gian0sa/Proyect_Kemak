using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.VentaDto
{
    public class VentaReadDTO
    {
        public int IdVenta { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public string TipoVenta { get; set; } = null!;
        public string ClienteNombre { get; set; } = null!;
        public string VendedorUsername { get; set; } = null!;
    }
}
