using Kemak.Application.DTOs.ClienteDTO;
using Kemak.Application.Interfaces;
using Kemak.Domain.Models;
using Kemak.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ProyKemakMultiplataforma.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClienteController : ControllerBase
{
    private readonly IClienteRepository _repository;
    private readonly ConsultaExternaService _externaService;
    public ClienteController(IClienteRepository repository, ConsultaExternaService externaService)
    {
        _repository = repository;
        _externaService = externaService;
    }

    // GET: api/Cliente
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var clientes = await _repository.GetAllAsync();
        var clientesDto = clientes.Select(c => new ClienteDTO
        {
            IdCliente = c.IdCliente,
            Nombre = c.Nombre,
            Dni = c.Dni,
            Telefono = c.Telefono,
            Email = c.Email,
            Direccion = c.Direccion,
            FechaRegistro = c.FechaRegistro
        });

        return Ok(clientesDto);
    }

    // GET: api/Cliente/5
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return NotFound(new { mensaje = "Cliente no encontrado" });

        var dto = new ClienteDTO
        {
            IdCliente = c.IdCliente,
            Nombre = c.Nombre,
            Dni = c.Dni,
            Telefono = c.Telefono,
            Email = c.Email,
            Direccion = c.Direccion,
            FechaRegistro = c.FechaRegistro
        };

        return Ok(dto);
    }

    // GET: api/Cliente/dni/12345678
    // Endpoint estratégico para el punto de venta
    [HttpGet("dni/{dni}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> GetByDni(string dni)
    {
        var c = await _repository.GetByDniAsync(dni);
        if (c == null) return NotFound(new { mensaje = "No existe cliente con ese DNI" });

        var dto = new ClienteDTO
        {
            IdCliente = c.IdCliente,
            Nombre = c.Nombre,
            Dni = c.Dni,
            Telefono = c.Telefono,
            Email = c.Email,
            Direccion = c.Direccion,
            FechaRegistro = c.FechaRegistro
        };

        return Ok(dto);
    }
    [HttpGet("buscar-reniec/{dni}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> BuscarEnReniec(string dni)
    {
        // 1. Buscar localmente primero (DB o Redis)
        var clienteLocal = await _repository.GetByDniAsync(dni);
        if (clienteLocal != null) return Ok(clienteLocal);

        // 2. Si no existe, llamar a Decolecta (RENIEC)
        var datosReniec = await _externaService.ConsultarDni(dni);

        if (datosReniec == null) return NotFound("No se encontró información en RENIEC");

        // 3. AUTO-REGISTRO: Guardar automáticamente en PostgreSQL
        var nuevoCliente = new Cliente
        {
            Nombre = datosReniec.full_name,
            Dni = dni,
            Activo = 1,
            FechaRegistro = DateTime.Now
        };

        await _repository.CreateAsync(nuevoCliente);

        // Devolvemos el cliente recién creado
        return Ok(nuevoCliente);
    }

    // POST: api/Cliente
    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> Create(ClienteCreateDTO dto)
    {
        // Validación de lógica: No duplicar DNI
        var existente = await _repository.GetByDniAsync(dto.Dni!);
        if (existente != null)
            return BadRequest(new { mensaje = "Ya existe un cliente registrado con este DNI" });
        var cliente = new Cliente
        {
            Nombre = dto.Nombre,
            Dni = dto.Dni,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Direccion = dto.Direccion,
            Activo = 1
        };

        await _repository.CreateAsync(cliente);

        return CreatedAtAction(nameof(GetById), new { id = cliente.IdCliente }, cliente);
    }

    // PUT: api/Cliente/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Vendedor_Licoreria,Vendedor_Mayorista,Vendedor_Toldos")]
    public async Task<IActionResult> Update(int id, ClienteCreateDTO dto)
    {
        // 1. Buscamos el cliente real en la DB usando tu repositorio
        var existente = await _repository.GetByIdAsync(id);
        if (existente == null) return NotFound(new { mensaje = "Cliente no encontrado" });

        // 2. RESTRICCIÓN DE SEGURIDAD: 
        // NO mapeamos existente.Nombre ni existente.Dni. 
        // Así, aunque el JSON envíe nombres diferentes, la DB conserva los datos originales de RENIEC.

        existente.Telefono = dto.Telefono;
        existente.Email = dto.Email;
        existente.Direccion = dto.Direccion;

        // 3. Guardamos los cambios (esto también limpia el caché de Redis automáticamente)
        await _repository.UpdateAsync(existente);

        return Ok(new { mensaje = "Datos de contacto actualizados correctamente", cliente = existente });
    }

    // DELETE: api/Cliente/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var existente = await _repository.GetByIdAsync(id);
        if (existente == null) return NotFound();

        await _repository.DeleteAsync(id);
        return NoContent();
    }
}