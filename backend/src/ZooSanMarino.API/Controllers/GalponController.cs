// file: src/ZooSanMarino.API/Controllers/GalponController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;                     // GalponDto, CreateGalponDto, UpdateGalponDto
using CommonDtos = ZooSanMarino.Application.DTOs.Common; // PagedResult<T>
using GalponDtos = ZooSanMarino.Application.DTOs.Galpones; // GalponDetailDto, GalponSearchRequest

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GalponController : ControllerBase
{
    private readonly IGalponService _svc;
    public GalponController(IGalponService svc) => _svc = svc;

    // ===========================
    // LISTADO SIMPLE (compat)
    // ===========================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GalponDtos.GalponDetailDto>>> GetAll()
    {
        var items = await _svc.GetAllAsync();
        return Ok(items);
    }

    // ===========================
    // BÚSQUEDA AVANZADA
    // ===========================
    [HttpGet("search")]
    public async Task<ActionResult<CommonDtos.PagedResult<GalponDtos.GalponDetailDto>>> Search([FromQuery] GalponDtos.GalponSearchRequest req)
    {
        var res = await _svc.SearchAsync(req);
        return Ok(res);
    }

    // ===========================
    // DETALLE COMPLETO
    // ===========================
    [HttpGet("{galponId}")]
    public async Task<ActionResult<GalponDtos.GalponDetailDto>> GetById(string galponId)
    {
        var res = await _svc.GetDetailByIdAsync(galponId);
        if (res is null) return NotFound();
        return Ok(res);
    }

    // ===========================
    // CREATE
    // ===========================
    [HttpPost]
    public async Task<ActionResult<GalponDtos.GalponDetailDto>> Create([FromBody] CreateGalponDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");

        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { galponId = created.GalponId }, created);
    }

    // ===========================
    // UPDATE
    // ===========================
    [HttpPut("{galponId}")]
    public async Task<ActionResult<GalponDtos.GalponDetailDto>> Update(string galponId, [FromBody] UpdateGalponDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (!string.Equals(dto.GalponId, galponId, StringComparison.OrdinalIgnoreCase))
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var updated = await _svc.UpdateAsync(dto);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // ===========================
    // DELETE (soft)
    // ===========================
    [HttpDelete("{galponId}")]
    public async Task<IActionResult> Delete(string galponId)
    {
        var ok = await _svc.DeleteAsync(galponId);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ===========================
    // DELETE (hard)
    // ===========================
    [HttpDelete("{galponId}/hard")]
    public async Task<IActionResult> HardDelete(string galponId)
    {
        var ok = await _svc.HardDeleteAsync(galponId);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ===========================
    // FILTRO POR GRANJA+NÚCLEO
    // ===========================
    [HttpGet("granja/{granjaId:int}/nucleo/{nucleoId}")]
    public async Task<ActionResult<IEnumerable<GalponDtos.GalponDetailDto>>> GetByGranjaAndNucleo(int granjaId, string nucleoId)
    {
        var items = await _svc.GetByGranjaAndNucleoAsync(granjaId, nucleoId);
        return Ok(items);
    }
}
