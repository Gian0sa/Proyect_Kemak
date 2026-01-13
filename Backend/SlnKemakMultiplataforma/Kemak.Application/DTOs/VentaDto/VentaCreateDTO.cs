using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.VentaDto
{
    public class VentaCreateDTO
    {
        public int IdCliente { get; set; }
        public int IdUsuario { get; set; } // ID del vendedor logueado
        public string TipoVenta { get; set; } = null!; // "LICORERIA", "MAYORISTA" o "TOLDO"
        public string? Observaciones { get; set; }

        // Lista de productos o toldos que se llevan
        public List<DetalleVentaCreateDTO> Detalles { get; set; } = new();

        // CAMPOS PARA ALQUILER (Solo se usan si TipoVenta == "TOLDO")
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
    }
}
