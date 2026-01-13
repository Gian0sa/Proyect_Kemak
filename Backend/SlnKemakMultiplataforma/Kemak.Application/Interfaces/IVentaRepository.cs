using Kemak.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.Interfaces
{
    public interface IVentaRepository
    {
        // Método maestro para registrar cualquier tipo de venta o alquiler
        Task<Ventum> RegistrarVentaAsync(Ventum venta, List<DetalleVentum> detalles, AlquilerToldo? alquiler = null);
        // Cambia esto en Kemak.Application.Interfaces
        Task RegistrarDevolucionAsync(int idAlquiler, string? observaciones, string estado);
        // Consultas para reportes y listados
        Task<IEnumerable<Ventum>> GetAllVentasAsync();
        Task<Ventum?> GetVentaByIdAsync(int id);
    }
}
