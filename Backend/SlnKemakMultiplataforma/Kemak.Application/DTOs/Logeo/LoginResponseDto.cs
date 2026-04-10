namespace Kemak.Application.DTOs.Logeo
{
    // Ejemplo de DTO de Respuesta de Login (o similar)
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new(); // Para manejar múltiples roles si fuera necesario
        public bool IsNewUser { get; set; }
    }
}
