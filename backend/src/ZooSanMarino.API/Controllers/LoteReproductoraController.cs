// file: src/ZooSanMarino.API/Controllers/LoteReproductoraController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoteReproductoraController : ControllerBase
{
    private readonly ILoteReproductoraService _svc;
    public LoteReproductoraController(ILoteReproductoraService svc) => _svc = svc;

    // ======================================
    // LISTADO (opcionalmente filtrado por lote)
    // ======================================
    // GET /api/LoteReproductora?loteId=L001
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LoteReproductoraDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LoteReproductoraDto>>> GetAll([FromQuery] string? loteId)
    {
        var items = await _svc.GetAllAsync(loteId);
        return Ok(items);
    }

    // ======================================
    // DETALLE
    // ======================================
    [HttpGet("{loteId}/{repId}")]
    [ProducesResponseType(typeof(LoteReproductoraDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoteReproductoraDto>> GetById(string loteId, string repId)
    {
        var dto = await _svc.GetByIdAsync(loteId, repId);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    // ======================================
    // CREAR (uno)
    // ======================================
    [HttpPost]
    [ProducesResponseType(typeof(LoteReproductoraDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoteReproductoraDto>> Create([FromBody] CreateLoteReproductoraDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        try
        {
            var crt = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { loteId = crt.LoteId, repId = crt.ReproductoraId }, crt);
        }
        catch (InvalidOperationException ex)
        {
            // Errores de negocio: duplicado, Lote no pertenece al tenant, etc.
            return BadRequest(ex.Message);
        }
    }

    // ======================================
    // CREAR (bulk)
    // ======================================
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(IEnumerable<LoteReproductoraDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<LoteReproductoraDto>>> CreateBulk([FromBody] IEnumerable<CreateLoteReproductoraDto> dtos)
    {
        if (dtos is null) return BadRequest("Body requerido.");
        try
        {
            var created = await _svc.CreateBulkAsync(dtos);
            // 201 sin Location específico (múltiples recursos)
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // ======================================
    // ACTUALIZAR
    // ======================================
    [HttpPut("{loteId}/{repId}")]
    [ProducesResponseType(typeof(LoteReproductoraDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoteReproductoraDto>> Update(string loteId, string repId, [FromBody] UpdateLoteReproductoraDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (dto.LoteId != loteId || dto.ReproductoraId != repId) return BadRequest("La ruta no coincide con el cuerpo.");

        var upd = await _svc.UpdateAsync(dto);
        if (upd is null) return NotFound();
        return Ok(upd);
    }

    // ======================================
    // ELIMINAR
    // ======================================
    [HttpDelete("{loteId}/{repId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string loteId, string repId)
    {
        var ok = await _svc.DeleteAsync(loteId, repId);
        return ok ? NoContent() : NotFound();
    }
}
