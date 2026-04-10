using BCrypt.Net;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kemak.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly KemakDbContext _context;

        public AuthRepository(KemakDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario> Registrar(Usuario usuario, string password)
        {
            // 1. Encriptar la contraseña
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);

            // 2. Buscar el rol predeterminado "Cliente" en PostgreSQL
            var rolCliente = await _context.Rols
                .FirstOrDefaultAsync(r => r.Nombre == "Cliente");

            if (rolCliente != null)
            {
                // 3. Asignar el rol al usuario (Relación N a N gestionada por EF)
                usuario.IdRols.Add(rolCliente);
            }

            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario?> Login(string email, string password)
        {
            // Buscar por nombre de usuario ignorando mayúsculas/minúsculas si es necesario
            var usuario = await _context.Usuarios
             .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            if (usuario == null) return null;

            // Verificar el Hash de BCrypt
            if (!BCrypt.Net.BCrypt.Verify(password, usuario.PasswordHash)) return null;

            return usuario;
        }

        public async Task<bool> ExisteUsuario(string username)
        {
            return await _context.Usuarios.AnyAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<List<string>> ObtenerRolesUsuario(int usuarioId)
        {
            // Retorna los nombres de los roles asociados al usuario
            return await _context.Usuarios
                .Where(u => u.IdUsuario == usuarioId)
                .SelectMany(u => u.IdRols.Select(r => r.Nombre))
                .ToListAsync();
        }
        public async Task<Usuario?> ObtenerUsuarioPorEmail(string email)
        {
            return await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<Usuario> RegistrarExterno(Usuario usuario)
        {
            // 1. Asignamos rol "Cliente" por defecto
            var rolCliente = await _context.Rols.FirstOrDefaultAsync(r => r.Nombre == "Cliente");
            if (rolCliente != null) usuario.IdRols.Add(rolCliente);

            // 2. Al ser Google, el PasswordHash puede ir vacío o con un valor genérico
            usuario.PasswordHash = "EXTERNAL_AUTH_GOOGLE";

            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }
    }
}