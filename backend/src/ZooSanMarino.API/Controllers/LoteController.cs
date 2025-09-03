using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;                     // CreateLoteDto, UpdateLoteDto, LoteDto
using CommonDtos = ZooSanMarino.Application.DTOs.Common; // PagedResult<T>
using LoteDtos   = ZooSanMarino.Application.DTOs.Lotes;  // LoteDetailDto, LoteSearchRequest

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Consumes("application/json")]
public class LoteController : ControllerBase
{
    private readonly ILoteService _svc;
    public LoteController(ILoteService svc) => _svc = svc;

    // ===========================
    // LISTADO SIMPLE (compat)
    // ===========================
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LoteDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LoteDto>>> GetAll()
    {
        var items = await _svc.GetAllAsync();
        return Ok(items);
    }

    // ===========================
    // BÚSQUEDA AVANZADA
    // ===========================
    [HttpGet("search")]
    [ProducesResponseType(typeof(CommonDtos.PagedResult<LoteDtos.LoteDetailDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<CommonDtos.PagedResult<LoteDtos.LoteDetailDto>>> Search([FromQuery] LoteDtos.LoteSearchRequest req)
    {
        var res = await _svc.SearchAsync(req);
        return Ok(res);
    }

    // ===========================
    // DETALLE
    // ===========================
    [HttpGet("{loteId}")]
    [ProducesResponseType(typeof(LoteDtos.LoteDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    [ProducesResponseType(typeof(LoteDtos.LoteDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoteDtos.LoteDetailDto>> Create([FromBody] CreateLoteDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (string.IsNullOrWhiteSpace(dto.LoteId))
            return BadRequest("LoteId es obligatorio.");

        try
        {
            var created = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { loteId = created.LoteId }, created);
        }
        catch (InvalidOperationException ex)
        {
            // Reglas de negocio (pertenencia, duplicados, etc.)
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // ===========================
    // UPDATE
    // ===========================
    [HttpPut("{loteId}")]
    [ProducesResponseType(typeof(LoteDtos.LoteDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoteDtos.LoteDetailDto>> Update(string loteId, [FromBody] UpdateLoteDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (string.IsNullOrWhiteSpace(dto.LoteId))
            return BadRequest("LoteId es obligatorio.");
        if (!string.Equals(loteId, dto.LoteId, StringComparison.OrdinalIgnoreCase))
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        try
        {
            var updated = await _svc.UpdateAsync(dto);
            if (updated is null) return NotFound();
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // ===========================
    // DELETE (soft)
    // ===========================
    [HttpDelete("{loteId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string loteId)
    {
        var ok = await _svc.DeleteAsync(loteId);
        return ok ? NoContent() : NotFound();
    }

    // ===========================
    // DELETE (hard)
    // ===========================
    [HttpDelete("{loteId}/hard")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> HardDelete(string loteId)
    {
        var ok = await _svc.HardDeleteAsync(loteId);
        return ok ? NoContent() : NotFound();
    }
}
