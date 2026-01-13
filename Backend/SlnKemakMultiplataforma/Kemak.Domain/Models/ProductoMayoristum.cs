using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class ProductoMayoristum
{
    public int IdProducto { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Marca { get; set; }

    public string? Categoria { get; set; }

    public string Presentacion { get; set; } = null!;

    public decimal Precio { get; set; }

    public int Stock { get; set; }

    public short? Activo { get; set; }

    public virtual ItemProductoMayoristum? ItemProductoMayoristum { get; set; }
}
