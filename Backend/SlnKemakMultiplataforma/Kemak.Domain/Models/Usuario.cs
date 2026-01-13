using System;
using System.Collections.Generic;

namespace Kemak.Domain.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Email { get; set; }

    public short? Estado { get; set; }

    public DateTime? FechaCreacion { get; set; }

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();

    public virtual ICollection<Rol> IdRols { get; set; } = new List<Rol>();
}
