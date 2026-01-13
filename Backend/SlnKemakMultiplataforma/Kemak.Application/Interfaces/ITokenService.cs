using Kemak.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.Interfaces
{
    public interface ITokenService
    {
        // Recibe el usuario y sus roles para meterlos dentro del Token
        string CrearToken(Usuario usuario, List<string> roles);
    }
}
