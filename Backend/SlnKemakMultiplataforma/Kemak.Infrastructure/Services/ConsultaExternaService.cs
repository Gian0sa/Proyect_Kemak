using Kemak.Application.DTOs;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Kemak.Infrastructure.Services;

public class ConsultaExternaService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public ConsultaExternaService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        // El token lo guardaremos en appsettings.json para seguridad
        _apiKey = config["Decolecta:Token"] ?? "";
    }

    public async Task<DecolectaDniResponse?> ConsultarDni(string dni)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _httpClient.GetAsync($"https://api.decolecta.com/v1/reniec/dni?numero={dni}");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<DecolectaDniResponse>(content);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error consultando RENIEC: {ex.Message}");
        }
        return null;
    }
}