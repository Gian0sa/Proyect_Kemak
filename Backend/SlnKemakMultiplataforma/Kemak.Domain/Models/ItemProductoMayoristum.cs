using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class ItemProductoMayoristum
{
    public int IdItem { get; set; }

    public int IdProducto { get; set; }

    public virtual ItemVentum IdItemNavigation { get; set; } = null!;

    public virtual ProductoMayoristum IdProductoNavigation { get; set; } = null!;
}
