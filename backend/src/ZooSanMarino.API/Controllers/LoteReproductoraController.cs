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

    // GET /api/LoteReproductora?loteId=L001  (filtrable)
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? loteId) =>
        Ok(await _svc.GetAllAsync(loteId));

    [HttpGet("{loteId}/{repId}")]
    public async Task<IActionResult> GetById(string loteId, string repId) =>
        (await _svc.GetByIdAsync(loteId, repId)) is LoteReproductoraDto dto ? Ok(dto) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLoteReproductoraDto dto)
    {
        var crt = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById),
            new { loteId = crt.LoteId, repId = crt.ReproductoraId }, crt);
    }

    // 👇 NUEVO: creación múltiple
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulk([FromBody] IEnumerable<CreateLoteReproductoraDto> dtos)
    {
        var created = await _svc.CreateBulkAsync(dtos);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{loteId}/{repId}")]
    public async Task<IActionResult> Update(string loteId, string repId, [FromBody] UpdateLoteReproductoraDto dto)
    {
        if (dto.LoteId != loteId || dto.ReproductoraId != repId) return BadRequest();
        return (await _svc.UpdateAsync(dto)) is LoteReproductoraDto upd ? Ok(upd) : NotFound();
    }

    [HttpDelete("{loteId}/{repId}")]
    public async Task<IActionResult> Delete(string loteId, string repId) =>
        (await _svc.DeleteAsync(loteId, repId)) ? NoContent() : NotFound();
}
