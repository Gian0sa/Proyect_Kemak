using System.Net;
using System.Text.Json;
using Kemak.Application.DTOs;

namespace ProyKemakMultiplataforma.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env; // Esto nos sirve para saber si estamos en modo Programador o ya en la Web real
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context); // Si todo va bien, sigue su camino
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // Por defecto es 500

        var response = new ErrorResponse
        {
            StatusCode = context.Response.StatusCode,
            Message = ex.Message,
            // Si estamos desarrollando, mostramos dónde falló el código. Si es producción, lo ocultamos por seguridad.
            Detail = _env.IsDevelopment() ? ex.StackTrace?.ToString() : "Ocurrió un error interno en el servidor."
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
    }
}