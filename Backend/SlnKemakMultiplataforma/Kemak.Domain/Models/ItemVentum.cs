using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class ItemVentum
{
    public int IdItem { get; set; }

    public string TipoItem { get; set; } = null!;

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual ItemProductoLicorerium? ItemProductoLicorerium { get; set; }

    public virtual ItemProductoMayoristum? ItemProductoMayoristum { get; set; }

    public virtual ItemToldo? ItemToldo { get; set; }
}
