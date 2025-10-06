using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DbStudioController : ControllerBase
    {
        private readonly IDbStudioService _dbStudioService;
        private readonly ILogger<DbStudioController> _logger;

        public DbStudioController(IDbStudioService dbStudioService, ILogger<DbStudioController> logger)
        {
            _dbStudioService = dbStudioService;
            _logger = logger;
        }

        // ===================== ESQUEMAS =====================
        [HttpGet("schemas")]
        public async Task<ActionResult<IEnumerable<SchemaDto>>> GetSchemas()
        {
            try
            {
                var schemas = await _dbStudioService.GetSchemasAsync();
                return Ok(schemas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener esquemas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ===================== TABLAS =====================
        [HttpGet("tables")]
        public async Task<ActionResult<IEnumerable<TableDto>>> GetTables([FromQuery] string? schema = null)
        {
            try
            {
                var tables = await _dbStudioService.GetTablesAsync(schema);
                return Ok(tables);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tablas para esquema: {Schema}", schema);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/details")]
        public async Task<ActionResult<TableDetailsDto>> GetTableDetails(string schema, string table)
        {
            try
            {
                var details = await _dbStudioService.GetTableDetailsAsync(schema, table);
                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener detalles de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/columns")]
        public async Task<ActionResult<IEnumerable<ColumnDto>>> GetTableColumns(string schema, string table)
        {
            try
            {
                var columns = await _dbStudioService.GetTableColumnsAsync(schema, table);
                return Ok(columns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener columnas de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/indexes")]
        public async Task<ActionResult<IEnumerable<IndexDto>>> GetTableIndexes(string schema, string table)
        {
            try
            {
                var indexes = await _dbStudioService.GetTableIndexesAsync(schema, table);
                return Ok(indexes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener índices de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/foreign-keys")]
        public async Task<ActionResult<IEnumerable<ForeignKeyDto>>> GetTableForeignKeys(string schema, string table)
        {
            try
            {
                var foreignKeys = await _dbStudioService.GetTableForeignKeysAsync(schema, table);
                return Ok(foreignKeys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener claves foráneas de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/stats")]
        public async Task<ActionResult<TableStatsDto>> GetTableStats(string schema, string table)
        {
            try
            {
                var stats = await _dbStudioService.GetTableStatsAsync(schema, table);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/preview")]
        public async Task<ActionResult<QueryPageDto>> PreviewTable(string schema, string table, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            try
            {
                var preview = await _dbStudioService.PreviewTableAsync(schema, table, limit, offset);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener preview de tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ===================== CONSULTAS SQL =====================
        [HttpPost("query/select")]
        public async Task<ActionResult<QueryPageDto>> ExecuteSelectQuery([FromBody] SelectQueryRequest request)
        {
            try
            {
                var result = await _dbStudioService.ExecuteSelectQueryAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar consulta SELECT");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("query/execute")]
        public async Task<ActionResult<QueryResultDto>> ExecuteQuery([FromBody] ExecuteQueryRequest request)
        {
            try
            {
                var result = await _dbStudioService.ExecuteQueryAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar consulta");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ===================== CREACIÓN Y MODIFICACIÓN =====================
        [HttpPost("tables")]
        public async Task<ActionResult> CreateTable([FromBody] CreateTableRequest request)
        {
            try
            {
                await _dbStudioService.CreateTableAsync(request);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear tabla {Schema}.{Table}", request.Schema, request.Table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpDelete("tables/{schema}/{table}")]
        public async Task<ActionResult> DropTable(string schema, string table, [FromQuery] bool cascade = false)
        {
            try
            {
                await _dbStudioService.DropTableAsync(schema, table, cascade);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("tables/{schema}/{table}/columns")]
        public async Task<ActionResult> AddColumn(string schema, string table, [FromBody] AddColumnRequest request)
        {
            try
            {
                await _dbStudioService.AddColumnAsync(schema, table, request);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al agregar columna a tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPatch("tables/{schema}/{table}/columns/{column}")]
        public async Task<ActionResult> AlterColumn(string schema, string table, string column, [FromBody] AlterColumnRequest request)
        {
            try
            {
                await _dbStudioService.AlterColumnAsync(schema, table, column, request);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al modificar columna {Column} de tabla {Schema}.{Table}", column, schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpDelete("tables/{schema}/{table}/columns/{column}")]
        public async Task<ActionResult> DropColumn(string schema, string table, string column)
        {
            try
            {
                await _dbStudioService.DropColumnAsync(schema, table, column);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar columna {Column} de tabla {Schema}.{Table}", column, schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ===================== UTILIDADES =====================
        [HttpGet("data-types")]
        public async Task<ActionResult<IEnumerable<string>>> GetDataTypes()
        {
            try
            {
                var dataTypes = await _dbStudioService.GetDataTypesAsync();
                return Ok(dataTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tipos de datos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("validate-sql")]
        public async Task<ActionResult<SqlValidationResult>> ValidateSql([FromBody] SqlValidationRequest request)
        {
            try
            {
                var result = await _dbStudioService.ValidateSqlAsync(request.Sql);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar SQL");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("tables/{schema}/{table}/export")]
        public async Task<IActionResult> ExportTable(string schema, string table, [FromQuery] string format = "sql")
        {
            try
            {
                var content = await _dbStudioService.ExportTableAsync(schema, table, format);
                var contentType = format.ToLower() switch
                {
                    "csv" => "text/csv",
                    "json" => "application/json",
                    "sql" => "application/sql",
                    _ => "application/octet-stream"
                };

                return File(content, contentType, $"{schema}_{table}.{format}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al exportar tabla {Schema}.{Table}", schema, table);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}