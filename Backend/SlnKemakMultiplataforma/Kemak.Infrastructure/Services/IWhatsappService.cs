using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Infrastructure.Services
{
    public interface IWhatsappService
    {
        Task EnviarMensajeTexto(string numero, string mensaje);
    }

    public class WhatsappService : IWhatsappService
    {
        private readonly HttpClient _httpClient;
        public WhatsappService(HttpClient httpClient) => _httpClient = httpClient;

        public async Task EnviarMensajeTexto(string numero, string mensaje)
        {
            var data = new { number = numero, message = mensaje };
            // URL sacada de tu captura de Factiliza
            var url = "https://apiwsp.factiliza.com/v1/message/sendtext/TU_INSTANCIA";

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", "TU_TOKEN_AQUÍ");

            await _httpClient.PostAsJsonAsync(url, data);
        }
    }
}
