using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class ItemToldo
{
    public int IdItem { get; set; }

    public int IdToldo { get; set; }

    public virtual ItemVentum IdItemNavigation { get; set; } = null!;

    public virtual Toldo IdToldoNavigation { get; set; } = null!;
}
