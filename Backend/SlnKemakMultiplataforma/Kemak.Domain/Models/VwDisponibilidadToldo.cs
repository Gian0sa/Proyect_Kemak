using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class VwDisponibilidadToldo
{
    public int? IdToldo { get; set; }

    public string? Modelo { get; set; }

    public string? Descripcion { get; set; }

    public decimal? PrecioAlquiler { get; set; }

    public short? Activo { get; set; }

    public int? IdAlquiler { get; set; }

    public DateOnly? FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public string? Estado { get; set; }
}
