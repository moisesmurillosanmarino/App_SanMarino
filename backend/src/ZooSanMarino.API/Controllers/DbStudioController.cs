using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs.DbStudio;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DbStudioController : ControllerBase
{
    private const string DefaultSchema = "public";

    private readonly IDbIntrospectionService _inspect;
    private readonly IDbSchemaService _schema;
    private readonly IReadOnlyQueryService _query;
    private readonly ILogger<DbStudioController> _logger;

    public DbStudioController(
        IDbIntrospectionService inspect,
        IDbSchemaService schema,
        IReadOnlyQueryService query,
        ILogger<DbStudioController> logger)
    {
        _inspect = inspect;
        _schema = schema;
        _query = query;
        _logger = logger;
    }

    // ===== Introspección =====
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("schemas")]
    [ProducesResponseType(typeof(List<SchemaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSchemas(CancellationToken ct) =>
        Ok(await _inspect.GetSchemasAsync(ct));

    // schema opcional via query (?schema=...) -> default "public"
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("tables")]
    [ProducesResponseType(typeof(List<TableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTables([FromQuery] string? schema, CancellationToken ct)
    {
        var sc = string.IsNullOrWhiteSpace(schema) ? DefaultSchema : schema;
        return Ok(await _inspect.GetTablesAsync(sc, ct));
    }

    // RUTA ORIGINAL (con schema explícito)
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("tables/{schema}/{table}/columns")]
    [ProducesResponseType(typeof(List<ColumnDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetColumns([FromRoute] string schema, [FromRoute] string table, CancellationToken ct) =>
        Ok(await _inspect.GetColumnsAsync(schema, table, ct));

    // NUEVA RUTA: schema opcional (usa "public")
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("tables/{table}/columns")]
    [ProducesResponseType(typeof(List<ColumnDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetColumnsDefault([FromRoute] string table, CancellationToken ct) =>
        Ok(await _inspect.GetColumnsAsync(DefaultSchema, table, ct));

    // RUTA ORIGINAL (con schema explícito)
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("tables/{schema}/{table}/preview")]
    [ProducesResponseType(typeof(QueryPageDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Preview([FromRoute] string schema, [FromRoute] string table, [FromQuery] int limit = 50, [FromQuery] int offset = 0, CancellationToken ct = default) =>
        Ok(await _inspect.PreviewAsync(schema, table, Math.Max(1, limit), Math.Max(0, offset), ct));

    // NUEVA RUTA: schema opcional (usa "public")
    [Authorize(Policy = "CanRunSelect")]
    [HttpGet("tables/{table}/preview")]
    [ProducesResponseType(typeof(QueryPageDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> PreviewDefault([FromRoute] string table, [FromQuery] int limit = 50, [FromQuery] int offset = 0, CancellationToken ct = default) =>
        Ok(await _inspect.PreviewAsync(DefaultSchema, table, Math.Max(1, limit), Math.Max(0, offset), ct));

    // ===== DDL =====
    [Authorize(Policy = "CanManageSchema")]
    [HttpPost("tables")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableDto dto, CancellationToken ct)
    {
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        await _schema.CreateTableAsync(dto, actor, ct);
        return NoContent();
    }

    [Authorize(Policy = "CanManageSchema")]
    [HttpPost("tables/{schema}/{table}/columns")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AddColumn([FromRoute] string schema, [FromRoute] string table, [FromBody] AddColumnDto dto, CancellationToken ct)
    {
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        await _schema.AddColumnAsync(schema, table, dto, actor, ct);
        return NoContent();
    }

    [Authorize(Policy = "CanManageSchema")]
    [HttpPatch("tables/{schema}/{table}/columns/{column}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AlterColumn([FromRoute] string schema, [FromRoute] string table, [FromRoute] string column, [FromBody] AlterColumnDto dto, CancellationToken ct)
    {
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        await _schema.AlterColumnAsync(schema, table, column, dto, actor, ct);
        return NoContent();
    }

    // ===== SELECT seguro =====
    [Authorize(Policy = "CanRunSelect")]
    [HttpPost("query/select")]
    [ProducesResponseType(typeof(QueryPageDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> RunSelect([FromBody] SelectQueryDto dto, CancellationToken ct)
    {
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        var page = await _query.RunSafeSelectAsync(dto, actor, ct);
        return Ok(page);
    }
}
