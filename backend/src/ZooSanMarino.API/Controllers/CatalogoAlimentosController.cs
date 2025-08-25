using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/catalogo-alimentos")]
public class CatalogoAlimentosController : ControllerBase
{
    private readonly ICatalogItemService _service;

    public CatalogoAlimentosController(ICatalogItemService service)
    {
        _service = service;
    }

    /// <summary>Lista con filtro, paginación y total.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CatalogItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] string? q = null,
                                         [FromQuery] int page = 1,
                                         [FromQuery] int pageSize = 20,
                                         CancellationToken ct = default)
    {
        var result = await _service.GetAsync(q, page, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Obtiene un item por Id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CatalogItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct = default)
    {
        var item = await _service.GetByIdAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Crea un nuevo item.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(CatalogItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CatalogItemCreateRequest req, CancellationToken ct = default)
    {
        var created = await _service.CreateAsync(req, ct);
        return created is null
            ? Conflict(new { message = "Código ya existe." })
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Actualiza un item existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CatalogItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update([FromRoute] int id,
                                            [FromBody] CatalogItemUpdateRequest req,
                                            CancellationToken ct = default)
    {
        var updated = await _service.UpdateAsync(id, req, ct);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    /// <summary>Elimina un item. Por defecto borrado lógico (activo=false). Usa ?hard=true para borrado físico.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id,
                                            [FromQuery] bool hard = false,
                                            CancellationToken ct = default)
    {
        var ok = await _service.DeleteAsync(id, hard, ct);
        return ok ? NoContent() : NotFound();
    }

    /// <summary>Upsert masivo por código.</summary>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpsertBulk([FromBody] IEnumerable<CatalogItemDto> items, CancellationToken ct = default)
        => Ok(await _service.UpsertBulkAsync(items, ct));
}
