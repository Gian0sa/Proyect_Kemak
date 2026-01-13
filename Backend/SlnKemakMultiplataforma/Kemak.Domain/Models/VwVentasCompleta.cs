using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class VwVentasCompleta
{
    public int? IdVenta { get; set; }

    public DateTime? Fecha { get; set; }

    public decimal? Total { get; set; }

    public string? TipoVenta { get; set; }

    public string? Vendedor { get; set; }

    public string? Cliente { get; set; }

    public string? ClienteDni { get; set; }

    public string? ClienteTelefono { get; set; }

    public string? Observaciones { get; set; }
}
