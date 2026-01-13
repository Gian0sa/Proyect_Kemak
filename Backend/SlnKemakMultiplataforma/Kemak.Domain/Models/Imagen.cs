using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kemak.Domain.Models;

public partial class Imagen
{
    public int IdImagen { get; set; }

    public string TipoEntidad { get; set; } = null!;

    public int IdEntidad { get; set; }

    public string Url { get; set; } = null!;

    public string? Descripcion { get; set; }

    public int? Orden { get; set; }

    [Column("public_id")]
    public string PublicId { get; set; } = string.Empty;
}
