using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeguimientoLoteLevanteController : ControllerBase
{
    private readonly ISeguimientoLoteLevanteService _svc;
    public SeguimientoLoteLevanteController(ISeguimientoLoteLevanteService svc) => _svc = svc;

    // ✅ Obtener todos los registros de un lote
    [HttpGet("por-lote/{loteId}")]
    public async Task<IActionResult> GetByLote(string loteId) =>
        Ok(await _svc.GetByLoteAsync(loteId));

    // ✅ Crear nuevo registro
    [HttpPost]
    public async Task<IActionResult> Create(SeguimientoLoteLevanteDto dto)
    {
        var result = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetByLote), new { loteId = result.LoteId }, result);
    }

    // ✅ Editar registro
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SeguimientoLoteLevanteDto dto)
    {
        if (id != dto.Id) return BadRequest("El ID no coincide con el DTO");

        var updated = await _svc.UpdateAsync(dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    // ✅ Eliminar registro
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _svc.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    // ✅ Filtrar por fechas opcionalmente con loteId
    [HttpGet("filtro")]
    public async Task<IActionResult> Filter([FromQuery] string? loteId, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var result = await _svc.FilterAsync(loteId, desde, hasta);
        return Ok(result);
    }
}
