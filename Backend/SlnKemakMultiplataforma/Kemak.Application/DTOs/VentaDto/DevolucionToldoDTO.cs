using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.VentaDto
{
    public class DevolucionToldoDTO
    {
        public int IdAlquiler { get; set; }
        public string? Observaciones { get; set; }
        public string Estado { get; set; } = "COMPLETADO"; // Puede ser "COMPLETADO", "CON_MORA" o "DAÑADO"
    }
}
