// src/ZooSanMarino.API/Controllers/FarmInventoryMovementsController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/farms/{farmId:int}/inventory/movements")]
public class FarmInventoryMovementsController : ControllerBase
{
    private readonly IFarmInventoryMovementService _service;

    public FarmInventoryMovementsController(IFarmInventoryMovementService service)
    {
        _service = service;
    }

    [HttpPost("in")]
    [ProducesResponseType(typeof(InventoryMovementDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> PostEntry([FromRoute] int farmId, [FromBody] InventoryEntryRequest req, CancellationToken ct = default)
    {
        var mov = await _service.PostEntryAsync(farmId, req, ct);
        return CreatedAtAction(nameof(PostEntry), new { farmId }, mov);
    }

    [HttpPost("out")]
    [ProducesResponseType(typeof(InventoryMovementDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> PostExit([FromRoute] int farmId, [FromBody] InventoryExitRequest req, CancellationToken ct = default)
    {
        var mov = await _service.PostExitAsync(farmId, req, ct);
        return CreatedAtAction(nameof(PostExit), new { farmId }, mov);
    }

    [HttpPost("transfer")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    public async Task<IActionResult> PostTransfer([FromRoute] int farmId, [FromBody] InventoryTransferRequest req, CancellationToken ct = default)
    {
        var (outMov, inMov) = await _service.PostTransferAsync(farmId, req, ct);
        return CreatedAtAction(nameof(PostTransfer), new { farmId }, new { Out = outMov, In = inMov });
    }
}
