using Kemak.Application.DTOs.GoogleDto;
using Kemak.Application.DTOs.Logeo;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepo;
        private readonly ITokenService _tokenService;
        private readonly IWhatsappService _whatsappService;

        public AuthController(IAuthRepository authRepo, ITokenService tokenService, IWhatsappService whatsappService)
        {
            _authRepo = authRepo;
            _tokenService = tokenService;
            _whatsappService = whatsappService;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar(UsuarioCreateDto dto)
        {
            if (await _authRepo.ExisteUsuario(dto.Username))
                return BadRequest("El nombre de usuario ya está en uso.");

            var nuevoUsuario = new Usuario
            {
                Username = dto.Username.ToLower(),
                Email = dto.Email.ToLower(),
                Estado = 1,
                FechaCreacion = DateTime.Now
            };

            await _authRepo.Registrar(nuevoUsuario, dto.Password);

            return Ok(new { mensaje = "Registro exitoso. Se ha asignado el rol de Cliente por defecto." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Pasamos el email del DTO al repositorio
            var usuario = await _authRepo.Login(dto.Email, dto.Password);

            if (usuario == null) return Unauthorized("Email o contraseña incorrectos.");

            var roles = await _authRepo.ObtenerRolesUsuario(usuario.IdUsuario);
            var token = _tokenService.CrearToken(usuario, roles);

            return Ok(new LoginResponseDto
            {
                Token = token,
                Username = usuario.Username,
                Email = usuario.Email ?? "",
                Roles = roles
            });
        }

        //
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // 1. Si usas Cookies para guardar el JWT, las limpiamos aquí
            Response.Cookies.Delete("jwt");

            // 2. Retornamos un mensaje de éxito para que el Frontend sepa que debe limpiar su estado
            return Ok(new { mensaje = "Sesión cerrada correctamente" });
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto dto)
        {
            // 1. Verificar si el usuario ya existe por Email
            var usuario = await _authRepo.ObtenerUsuarioPorEmail(dto.Email);
            bool esNuevo = false;

            if (usuario == null)
            {
                // 2. REGISTRO AUTOMÁTICO: Si no existe, lo creamos con la info de Google
                usuario = new Usuario
                {
                    // Limpiamos el nombre para que sea un Username válido (sin espacios)
                    Username = dto.Name.Replace(" ", "").ToLower() + Guid.NewGuid().ToString().Substring(0, 4),
                    Email = dto.Email.ToLower(),
                    Estado = 1,
                    FechaCreacion = DateTime.Now
                };

                await _authRepo.RegistrarExterno(usuario);
                esNuevo = true;
            }

            // 3. GENERAR CREDENCIALES DE KEMAK (JWT)
            var roles = await _authRepo.ObtenerRolesUsuario(usuario.IdUsuario);
            var token = _tokenService.CrearToken(usuario, roles);

            // 4. RESPUESTA AL FRONTEND
            return Ok(new LoginResponseDto
            {
                Token = token,
                Username = usuario.Username,
                Email = usuario.Email ?? "",
                Roles = roles,
           
                IsNewUser = esNuevo
            });
        }

    }

}