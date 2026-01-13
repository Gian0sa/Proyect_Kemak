using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class AlquilerToldo
{
    public int IdAlquiler { get; set; }

    public int IdToldo { get; set; }

    public int IdVenta { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFin { get; set; }

    public string Estado { get; set; } = null!;

    public DateOnly? FechaDevolucion { get; set; }

    public string? Observaciones { get; set; }

    public virtual Toldo IdToldoNavigation { get; set; } = null!;

    public virtual Ventum IdVentaNavigation { get; set; } = null!;
}
