// file: src/ZooSanMarino.API/Controllers/LoteController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;                    // CreateLoteDto, UpdateLoteDto, LoteDto
using CommonDtos = ZooSanMarino.Application.DTOs.Common; // PagedResult<T>
using LoteDtos   = ZooSanMarino.Application.DTOs.Lotes;  // LoteDetailDto, LoteSearchRequest

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoteController : ControllerBase
{
    private readonly ILoteService _svc;
    public LoteController(ILoteService svc) => _svc = svc;

    // ===========================
    // LISTADO SIMPLE (compat)
    // ===========================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoteDto>>> GetAll()
    {
        var items = await _svc.GetAllAsync();
        return Ok(items);
    }

    // ===========================
    // BÚSQUEDA AVANZADA
    // ===========================
    [HttpGet("search")]
    public async Task<ActionResult<CommonDtos.PagedResult<LoteDtos.LoteDetailDto>>> Search([FromQuery] LoteDtos.LoteSearchRequest req)
    {
        var res = await _svc.SearchAsync(req);
        return Ok(res);
    }

    // ===========================
    // DETALLE
    // ===========================
    [HttpGet("{loteId}")]
    public async Task<ActionResult<LoteDtos.LoteDetailDto>> GetById(string loteId)
    {
        var res = await _svc.GetByIdAsync(loteId);
        if (res is null) return NotFound();
        return Ok(res);
    }

    // ===========================
    // CREATE
    // ===========================
    [HttpPost]
    public async Task<ActionResult<LoteDtos.LoteDetailDto>> Create([FromBody] CreateLoteDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (string.IsNullOrWhiteSpace(dto.LoteId))
            return BadRequest("LoteId es obligatorio.");

        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { loteId = created.LoteId }, created);
    }

    // ===========================
    // UPDATE
    // ===========================
    [HttpPut("{loteId}")]
    public async Task<ActionResult<LoteDtos.LoteDetailDto>> Update(string loteId, [FromBody] UpdateLoteDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (string.IsNullOrWhiteSpace(dto.LoteId))
            return BadRequest("LoteId es obligatorio.");
        if (!string.Equals(loteId, dto.LoteId, StringComparison.OrdinalIgnoreCase))
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var updated = await _svc.UpdateAsync(dto);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // ===========================
    // DELETE (soft)
    // ===========================
    [HttpDelete("{loteId}")]
    public async Task<IActionResult> Delete(string loteId)
    {
        var ok = await _svc.DeleteAsync(loteId);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ===========================
    // DELETE (hard)
    // ===========================
    [HttpDelete("{loteId}/hard")]
    public async Task<IActionResult> HardDelete(string loteId)
    {
        var ok = await _svc.HardDeleteAsync(loteId);
        if (!ok) return NotFound();
        return NoContent();
    }
}
