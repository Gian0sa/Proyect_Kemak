using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class DetalleVentum
{
    public int IdDetalle { get; set; }

    public int IdVenta { get; set; }

    public int IdItem { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal? Subtotal { get; set; }

    public virtual ItemVentum IdItemNavigation { get; set; } = null!;

    public virtual Ventum IdVentaNavigation { get; set; } = null!;
}
