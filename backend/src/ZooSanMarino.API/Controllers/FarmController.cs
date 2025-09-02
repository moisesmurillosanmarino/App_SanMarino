// file: src/ZooSanMarino.API/Controllers/FarmController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;                     // FarmDto, CreateFarmDto, UpdateFarmDto
using CommonDtos = ZooSanMarino.Application.DTOs.Common; // PagedResult<T>
using FarmDtos   = ZooSanMarino.Application.DTOs.Farms;  // FarmDetailDto, FarmSearchRequest, FarmTreeDto

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FarmController : ControllerBase
{
    private readonly IFarmService _svc;
    public FarmController(IFarmService svc) => _svc = svc;

    // ===========================
    // LISTADO SIMPLE (compat)
    // ===========================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FarmDto>>> GetAll()
    {
        var items = await _svc.GetAllAsync();
        return Ok(items);
    }

    // ===========================
    // BÚSQUEDA AVANZADA
    // ===========================
    [HttpGet("search")]
    public async Task<ActionResult<CommonDtos.PagedResult<FarmDtos.FarmDetailDto>>> Search([FromQuery] FarmDtos.FarmSearchRequest req)
    {
        var res = await _svc.SearchAsync(req);
        return Ok(res);
    }

    // ===========================
    // DETALLE (incluye métricas)
    // ===========================
    [HttpGet("{id:int}")]
    public async Task<ActionResult<FarmDtos.FarmDetailDto>> GetDetail(int id)
    {
        var res = await _svc.GetDetailByIdAsync(id);
        if (res is null) return NotFound();
        return Ok(res);
    }

    // (Opcional) GET básico por id para compatibilidad con UIs antiguas
    [HttpGet("{id:int}/basic")]
    public async Task<ActionResult<FarmDto>> GetByIdBasic(int id)
    {
        var res = await _svc.GetByIdAsync(id);
        if (res is null) return NotFound();
        return Ok(res);
    }

    // ===========================
    // ÁRBOL (Farm → Núcleos → Galpones)
    // ===========================
    [HttpGet("{id:int}/tree")]
    public async Task<ActionResult<FarmDtos.FarmTreeDto>> GetTree(int id, [FromQuery] bool soloActivos = true)
    {
        var res = await _svc.GetTreeByIdAsync(id, soloActivos);
        if (res is null) return NotFound();
        return Ok(res);
    }

    // ===========================
    // CREATE
    // ===========================
    [HttpPost]
    public async Task<ActionResult<FarmDto>> Create([FromBody] CreateFarmDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        var created = await _svc.CreateAsync(dto);
        // Apuntamos al detalle recién creado
        return CreatedAtAction(nameof(GetDetail), new { id = created.Id }, created);
    }

    // ===========================
    // UPDATE
    // ===========================
    [HttpPut("{id:int}")]
    public async Task<ActionResult<FarmDto>> Update(int id, [FromBody] UpdateFarmDto dto)
    {
        if (dto is null) return BadRequest("Body requerido.");
        if (id != dto.Id) return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var updated = await _svc.UpdateAsync(dto);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // ===========================
    // DELETE (soft)
    // ===========================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _svc.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ===========================
    // DELETE (hard)
    // ===========================
    [HttpDelete("{id:int}/hard")]
    public async Task<IActionResult> HardDelete(int id)
    {
        var ok = await _svc.HardDeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
