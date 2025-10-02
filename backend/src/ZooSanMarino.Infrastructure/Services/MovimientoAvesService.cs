// src/ZooSanMarino.Infrastructure/Services/MovimientoAvesService.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class MovimientoAvesService : IMovimientoAvesService
{
    private readonly ZooSanMarinoContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IInventarioAvesService _inventarioService;
    private readonly IHistorialInventarioService _historialService;

    public MovimientoAvesService(
        ZooSanMarinoContext context, 
        ICurrentUser currentUser,
        IInventarioAvesService inventarioService,
        IHistorialInventarioService historialService)
    {
        _context = context;
        _currentUser = currentUser;
        _inventarioService = inventarioService;
        _historialService = historialService;
    }

    public async Task<MovimientoAvesDto> CreateAsync(CreateMovimientoAvesDto dto)
    {
        // Validar movimiento
        var esValido = await ValidarMovimientoAsync(dto);
        if (!esValido)
            throw new InvalidOperationException("El movimiento no es válido");

        var movimiento = new MovimientoAves
        {
            FechaMovimiento = dto.FechaMovimiento,
            TipoMovimiento = dto.TipoMovimiento,
            InventarioOrigenId = dto.InventarioOrigenId,
            LoteOrigenId = dto.LoteOrigenId,
            GranjaOrigenId = dto.GranjaOrigenId,
            NucleoOrigenId = dto.NucleoOrigenId,
            GalponOrigenId = dto.GalponOrigenId,
            InventarioDestinoId = dto.InventarioDestinoId,
            LoteDestinoId = dto.LoteDestinoId,
            GranjaDestinoId = dto.GranjaDestinoId,
            NucleoDestinoId = dto.NucleoDestinoId,
            GalponDestinoId = dto.GalponDestinoId,
            CantidadHembras = dto.CantidadHembras,
            CantidadMachos = dto.CantidadMachos,
            CantidadMixtas = dto.CantidadMixtas,
            MotivoMovimiento = dto.MotivoMovimiento,
            Observaciones = dto.Observaciones,
            Estado = "Pendiente",
            UsuarioMovimientoId = dto.UsuarioMovimientoId > 0 ? dto.UsuarioMovimientoId : _currentUser.UserId,
            CompanyId = _currentUser.CompanyId,
            CreatedByUserId = _currentUser.UserId,
            CreatedAt = DateTime.UtcNow
        };

        // Generar número de movimiento
        _context.MovimientoAves.Add(movimiento);
        await _context.SaveChangesAsync();

        movimiento.NumeroMovimiento = movimiento.GenerarNumeroMovimiento();
        await _context.SaveChangesAsync();

        return await GetByIdAsync(movimiento.Id) ?? throw new InvalidOperationException("Error al crear movimiento");
    }

    public async Task<MovimientoAvesDto?> GetByIdAsync(int id)
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.Id == id && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    public async Task<MovimientoAvesDto?> GetByNumeroMovimientoAsync(string numeroMovimiento)
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.NumeroMovimiento == numeroMovimiento && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<MovimientoAvesDto>> GetAllAsync()
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .OrderByDescending(m => m.FechaMovimiento)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<ZooSanMarino.Application.DTOs.Common.PagedResult<MovimientoAvesDto>> SearchAsync(MovimientoAvesSearchRequest request)
    {
        var query = _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null);

        // Aplicar filtros
        if (!string.IsNullOrEmpty(request.NumeroMovimiento))
            query = query.Where(m => m.NumeroMovimiento.Contains(request.NumeroMovimiento));

        if (!string.IsNullOrEmpty(request.TipoMovimiento))
            query = query.Where(m => m.TipoMovimiento == request.TipoMovimiento);

        if (!string.IsNullOrEmpty(request.Estado))
            query = query.Where(m => m.Estado == request.Estado);

        if (!string.IsNullOrEmpty(request.LoteOrigenId))
            query = query.Where(m => m.LoteOrigenId == request.LoteOrigenId);

        if (!string.IsNullOrEmpty(request.LoteDestinoId))
            query = query.Where(m => m.LoteDestinoId == request.LoteDestinoId);

        if (request.GranjaOrigenId.HasValue)
            query = query.Where(m => m.GranjaOrigenId == request.GranjaOrigenId.Value);

        if (request.GranjaDestinoId.HasValue)
            query = query.Where(m => m.GranjaDestinoId == request.GranjaDestinoId.Value);

        if (request.FechaDesde.HasValue)
            query = query.Where(m => m.FechaMovimiento >= request.FechaDesde.Value);

        if (request.FechaHasta.HasValue)
            query = query.Where(m => m.FechaMovimiento <= request.FechaHasta.Value);

        if (request.UsuarioMovimientoId.HasValue)
            query = query.Where(m => m.UsuarioMovimientoId == request.UsuarioMovimientoId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(m => m.FechaMovimiento)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ToDto)
            .ToListAsync();

        return new ZooSanMarino.Application.DTOs.Common.PagedResult<MovimientoAvesDto>
        {
            Items = items,
            Total = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<IEnumerable<MovimientoAvesDto>> GetMovimientosPendientesAsync()
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.Estado == "Pendiente" && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .OrderBy(m => m.FechaMovimiento)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<IEnumerable<MovimientoAvesDto>> GetMovimientosByLoteAsync(string loteId)
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => (m.LoteOrigenId == loteId || m.LoteDestinoId == loteId) && 
                       m.CompanyId == _currentUser.CompanyId && 
                       m.DeletedAt == null)
            .OrderByDescending(m => m.FechaMovimiento)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<IEnumerable<MovimientoAvesDto>> GetMovimientosByUsuarioAsync(int usuarioId)
    {
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.UsuarioMovimientoId == usuarioId && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .OrderByDescending(m => m.FechaMovimiento)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<ResultadoMovimientoDto> ProcesarMovimientoAsync(ProcesarMovimientoDto dto)
    {
        var movimiento = await _context.MovimientoAves
            .Where(m => m.Id == dto.MovimientoId && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (movimiento == null)
            return new ResultadoMovimientoDto(false, "Movimiento no encontrado", null, null, new List<string> { "Movimiento no encontrado" }, null);

        if (movimiento.Estado != "Pendiente")
            return new ResultadoMovimientoDto(false, "El movimiento ya fue procesado o cancelado", null, null, new List<string> { "Estado inválido" }, null);

        try
        {
            // Procesar el movimiento (implementación básica)
            movimiento.Procesar();
            if (!string.IsNullOrEmpty(dto.ObservacionesProcesamiento))
                movimiento.Observaciones = $"{movimiento.Observaciones} | {dto.ObservacionesProcesamiento}";

            await _context.SaveChangesAsync();

            var movimientoDto = await GetByIdAsync(movimiento.Id);
            return new ResultadoMovimientoDto(true, "Movimiento procesado exitosamente", movimiento.Id, movimiento.NumeroMovimiento, new List<string>(), movimientoDto);
        }
        catch (Exception ex)
        {
            return new ResultadoMovimientoDto(false, "Error al procesar movimiento", movimiento.Id, movimiento.NumeroMovimiento, new List<string> { ex.Message }, null);
        }
    }

    public async Task<ResultadoMovimientoDto> CancelarMovimientoAsync(CancelarMovimientoDto dto)
    {
        var movimiento = await _context.MovimientoAves
            .Where(m => m.Id == dto.MovimientoId && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (movimiento == null)
            return new ResultadoMovimientoDto(false, "Movimiento no encontrado", null, null, new List<string> { "Movimiento no encontrado" }, null);

        try
        {
            movimiento.Cancelar(dto.MotivoCancelacion);
            await _context.SaveChangesAsync();

            var movimientoDto = await GetByIdAsync(movimiento.Id);
            return new ResultadoMovimientoDto(true, "Movimiento cancelado exitosamente", movimiento.Id, movimiento.NumeroMovimiento, new List<string>(), movimientoDto);
        }
        catch (Exception ex)
        {
            return new ResultadoMovimientoDto(false, "Error al cancelar movimiento", movimiento.Id, movimiento.NumeroMovimiento, new List<string> { ex.Message }, null);
        }
    }

    public async Task<ResultadoMovimientoDto> TrasladoRapidoAsync(TrasladoRapidoDto dto)
    {
        try
        {
            // Implementación básica del traslado rápido
            var createDto = new CreateMovimientoAvesDto
            {
                FechaMovimiento = DateTime.UtcNow,
                TipoMovimiento = "Traslado",
                LoteOrigenId = dto.LoteId,
                GranjaOrigenId = dto.GranjaOrigenId,
                NucleoOrigenId = dto.NucleoOrigenId,
                GalponOrigenId = dto.GalponOrigenId,
                GranjaDestinoId = dto.GranjaDestinoId,
                NucleoDestinoId = dto.NucleoDestinoId,
                GalponDestinoId = dto.GalponDestinoId,
                CantidadHembras = dto.CantidadHembras ?? 0,
                CantidadMachos = dto.CantidadMachos ?? 0,
                CantidadMixtas = dto.CantidadMixtas ?? 0,
                MotivoMovimiento = dto.MotivoTraslado,
                Observaciones = dto.Observaciones,
                UsuarioMovimientoId = _currentUser.UserId
            };

            var movimiento = await CreateAsync(createDto);

            if (dto.ProcesarInmediatamente)
            {
                var procesarDto = new ProcesarMovimientoDto
                {
                    MovimientoId = movimiento.Id,
                    AutoCrearInventarioDestino = true
                };
                return await ProcesarMovimientoAsync(procesarDto);
            }

            return new ResultadoMovimientoDto(true, "Traslado creado exitosamente", movimiento.Id, movimiento.NumeroMovimiento, new List<string>(), movimiento);
        }
        catch (Exception ex)
        {
            return new ResultadoMovimientoDto(false, "Error en traslado rápido", null, null, new List<string> { ex.Message }, null);
        }
    }

    // Implementaciones básicas de los métodos restantes
    public Task<ResultadoMovimientoDto> TrasladarEntreGranjasAsync(string loteId, int granjaOrigenId, int granjaDestinoId, int hembras, int machos, int mixtas, string? motivo = null)
    {
        throw new NotImplementedException("Método pendiente de implementación completa");
    }

    public Task<ResultadoMovimientoDto> TrasladarDentroGranjaAsync(string loteId, int granjaId, string? nucleoOrigenId, string? galponOrigenId, string? nucleoDestinoId, string? galponDestinoId, int hembras, int machos, int mixtas, string? motivo = null)
    {
        throw new NotImplementedException("Método pendiente de implementación completa");
    }

    public Task<ResultadoMovimientoDto> DividirLoteAsync(string loteOrigenId, string loteDestinoId, int hembras, int machos, int mixtas, string? motivo = null)
    {
        throw new NotImplementedException("Método pendiente de implementación completa");
    }

    public Task<ResultadoMovimientoDto> UnificarLotesAsync(string loteOrigenId, string loteDestinoId, string? motivo = null)
    {
        throw new NotImplementedException("Método pendiente de implementación completa");
    }

    public async Task<bool> ValidarMovimientoAsync(CreateMovimientoAvesDto dto)
    {
        // Validación básica
        return (dto.CantidadHembras + dto.CantidadMachos + dto.CantidadMixtas) > 0 && 
               (!string.IsNullOrEmpty(dto.LoteOrigenId) || dto.InventarioOrigenId.HasValue) &&
               (!string.IsNullOrEmpty(dto.LoteDestinoId) || dto.InventarioDestinoId.HasValue);
    }

    public async Task<List<string>> ValidarDisponibilidadAvesAsync(int inventarioOrigenId, int hembras, int machos, int mixtas)
    {
        var errores = new List<string>();
        
        var puedeRealizar = await _inventarioService.PuedeRealizarMovimientoAsync(inventarioOrigenId, hembras, machos, mixtas);
        if (!puedeRealizar)
            errores.Add("No hay suficientes aves disponibles para el movimiento");

        return errores;
    }

    public async Task<bool> ValidarUbicacionDestinoAsync(int granjaId, string? nucleoId, string? galponId)
    {
        // Validación básica - verificar que la granja existe
        return await _context.Farms
            .Where(f => f.Id == granjaId && f.CompanyId == _currentUser.CompanyId)
            .AnyAsync();
    }

    public async Task<IEnumerable<MovimientoAvesDto>> GetMovimientosRecientesAsync(int dias = 7)
    {
        var fechaDesde = DateTime.UtcNow.AddDays(-dias);
        return await _context.MovimientoAves
            .AsNoTracking()
            .Where(m => m.FechaMovimiento >= fechaDesde && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .OrderByDescending(m => m.FechaMovimiento)
            .Take(50)
            .Select(ToDto)
            .ToListAsync();
    }

    public async Task<int> GetTotalMovimientosPendientesAsync()
    {
        return await _context.MovimientoAves
            .Where(m => m.Estado == "Pendiente" && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null)
            .CountAsync();
    }

    public async Task<int> GetTotalMovimientosCompletadosAsync(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
    {
        var query = _context.MovimientoAves
            .Where(m => m.Estado == "Completado" && m.CompanyId == _currentUser.CompanyId && m.DeletedAt == null);

        if (fechaDesde.HasValue)
            query = query.Where(m => m.FechaProcesamiento >= fechaDesde.Value);

        if (fechaHasta.HasValue)
            query = query.Where(m => m.FechaProcesamiento <= fechaHasta.Value);

        return await query.CountAsync();
    }

    private static System.Linq.Expressions.Expression<Func<MovimientoAves, MovimientoAvesDto>> ToDto =>
        m => new MovimientoAvesDto(
            m.Id,
            m.NumeroMovimiento,
            m.FechaMovimiento,
            m.TipoMovimiento,
            // Origen
            new UbicacionMovimientoDto(
                m.LoteOrigenId,
                m.LoteOrigen != null ? m.LoteOrigen.LoteNombre : null,
                m.GranjaOrigenId,
                m.GranjaOrigen != null ? m.GranjaOrigen.Name : null,
                m.NucleoOrigenId,
                m.NucleoOrigen != null ? m.NucleoOrigen.NucleoNombre : null,
                m.GalponOrigenId,
                m.GalponOrigen != null ? m.GalponOrigen.GalponNombre : null
            ),
            // Destino
            new UbicacionMovimientoDto(
                m.LoteDestinoId,
                m.LoteDestino != null ? m.LoteDestino.LoteNombre : null,
                m.GranjaDestinoId,
                m.GranjaDestino != null ? m.GranjaDestino.Name : null,
                m.NucleoDestinoId,
                m.NucleoDestino != null ? m.NucleoDestino.NucleoNombre : null,
                m.GalponDestinoId,
                m.GalponDestino != null ? m.GalponDestino.GalponNombre : null
            ),
            // Cantidades
            m.CantidadHembras,
            m.CantidadMachos,
            m.CantidadMixtas,
            m.CantidadHembras + m.CantidadMachos + m.CantidadMixtas,
            // Estado e información
            m.Estado,
            m.MotivoMovimiento,
            m.Observaciones,
            // Usuario
            m.UsuarioMovimientoId,
            m.UsuarioNombre,
            // Fechas
            m.FechaProcesamiento,
            m.FechaCancelacion,
            m.CreatedAt
        );
}
