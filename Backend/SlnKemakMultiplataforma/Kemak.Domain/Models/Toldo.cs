using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class Toldo
{
    public int IdToldo { get; set; }

    public string Modelo { get; set; } = null!;

    public string? Descripcion { get; set; }

    public decimal PrecioAlquiler { get; set; }

    public short? Activo { get; set; }

    public virtual ICollection<AlquilerToldo> AlquilerToldos { get; set; } = new List<AlquilerToldo>();

    public virtual ItemToldo? ItemToldo { get; set; }
}
