using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class Ventum
{
    public int IdVenta { get; set; }

    public DateTime? Fecha { get; set; }

    public decimal Total { get; set; }

    public string TipoVenta { get; set; } = null!;

    public int IdUsuario { get; set; }

    public int IdCliente { get; set; }

    public string? Observaciones { get; set; }

    public virtual ICollection<AlquilerToldo> AlquilerToldos { get; set; } = new List<AlquilerToldo>();

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
