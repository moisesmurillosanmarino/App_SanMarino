using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoteController : ControllerBase
{
    private readonly ILoteService _svc;
    public LoteController(ILoteService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _svc.GetAllAsync());

    [HttpGet("{loteId}")]
    public async Task<IActionResult> GetById(string loteId) =>
        (await _svc.GetByIdAsync(loteId)) is LoteDto dto
            ? Ok(dto)
            : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement input)
    {
        var payload = input.TryGetProperty("dto", out var innerDto) ? innerDto : input;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        // 🔐 Serializamos como texto para forzar la conversión correcta
        var json = payload.GetRawText();

        // Verificamos manualmente el valor de LoteId
        using var doc = JsonDocument.Parse(json);
        if (!doc.RootElement.TryGetProperty("loteId", out var loteIdProp))
            return BadRequest("Falta el campo loteId.");

        // 🔄 Forzamos a string (sea int o string)
        var loteId = loteIdProp.ValueKind switch
        {
            JsonValueKind.Number => loteIdProp.GetInt32().ToString(),
            JsonValueKind.String => loteIdProp.GetString(),
            _ => null
        };

        if (string.IsNullOrWhiteSpace(loteId))
            return BadRequest("El LoteId es obligatorio y debe ser válido.");

        var dto = JsonSerializer.Deserialize<CreateLoteDto>(json, options);
        if (dto is null)
            return BadRequest("No se pudo deserializar el objeto recibido.");

        // ✅ LoteId corregido explícitamente
        dto.LoteId = loteId!.Trim();

        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { loteId = created.LoteId }, created);
    }

    [HttpPut("{loteId}")]
    public async Task<IActionResult> Update(string loteId, [FromBody] JsonElement input)
    {
        // Soporta ambos formatos: { ... } o { dto: { ... } }
        var payload = input.TryGetProperty("dto", out var innerDto) ? innerDto : input;

        var dto = JsonSerializer.Deserialize<UpdateLoteDto>(payload.GetRawText(), new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (dto is null)
            return BadRequest("No se pudo deserializar el objeto recibido.");

        if (string.IsNullOrWhiteSpace(dto.LoteId))
            return BadRequest("El campo LoteId es obligatorio.");

        if (dto.LoteId.Trim() != loteId)
            return BadRequest("El ID en la URL no coincide con el del cuerpo de la solicitud.");

        // Usamos `with` para asegurarnos de que LoteId esté limpio, sin mutarlo directamente
        var fixedDto = dto with { LoteId = dto.LoteId.Trim() };

        var updated = await _svc.UpdateAsync(fixedDto);
        return updated is not null
            ? Ok(updated)
            : NotFound();
    }

    [HttpDelete("{loteId}")]
    public async Task<IActionResult> Delete(string loteId) =>
        (await _svc.DeleteAsync(loteId)) ? NoContent() : NotFound();
}
