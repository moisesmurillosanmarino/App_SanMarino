// src/ZooSanMarino.API/Controllers/FarmInventoryController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/farms/{farmId:int}/inventory")]
public class FarmInventoryController : ControllerBase
{
    private readonly IFarmInventoryService _service;

    public FarmInventoryController(IFarmInventoryService service)
    {
        _service = service;
    }

    // Listar inventario de una granja
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<FarmInventoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromRoute] int farmId,
                                            [FromQuery] string? q = null,
                                            CancellationToken ct = default)
    {
        var items = await _service.GetByFarmAsync(farmId, q, ct);
        return Ok(items);
    }

    // Obtener un registro
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(FarmInventoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int farmId,
                                             [FromRoute] int id,
                                             CancellationToken ct = default)
    {
        var item = await _service.GetByIdAsync(farmId, id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    // Crear/Reemplazar por (farmId, catalogItemId)
    [HttpPost]
    [ProducesResponseType(typeof(FarmInventoryDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOrReplace([FromRoute] int farmId,
                                                     [FromBody] FarmInventoryCreateRequest req,
                                                     CancellationToken ct = default)
    {
        var created = await _service.CreateOrReplaceAsync(farmId, req, ct);
        return CreatedAtAction(nameof(GetById), new { farmId, id = created.Id }, created);
    }

    // Actualizar por Id
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(FarmInventoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int farmId,
                                            [FromRoute] int id,
                                            [FromBody] FarmInventoryUpdateRequest req,
                                            CancellationToken ct = default)
    {
        var updated = await _service.UpdateAsync(farmId, id, req, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    // Eliminar (lógico por defecto)
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int farmId,
                                            [FromRoute] int id,
                                            [FromQuery] bool hard = false,
                                            CancellationToken ct = default)
    {
        var ok = await _service.DeleteAsync(farmId, id, hard, ct);
        return ok ? NoContent() : NotFound();
    }
}
