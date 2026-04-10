using Kemak.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.Interfaces
{
    public interface IAuthRepository
    {
        Task<Usuario> Registrar(Usuario usuario, string password);
        Task<Usuario?> Login(string email, string password);
        Task<bool> ExisteUsuario(string username);
        Task<List<string>> ObtenerRolesUsuario(int usuarioId);


        Task<Usuario?> ObtenerUsuarioPorEmail(string email);
        Task<Usuario> RegistrarExterno(Usuario usuario);
    }
}
