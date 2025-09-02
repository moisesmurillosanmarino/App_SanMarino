// file: src/ZooSanMarino.Infrastructure/Services/LoteReproductoraService.cs
using Microsoft.EntityFrameworkCore;
using System.Linq;
using AppInterfaces = ZooSanMarino.Application.Interfaces; // ILoteReproductoraService, ICurrentUser
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class LoteReproductoraService : AppInterfaces.ILoteReproductoraService
{
    private readonly ZooSanMarinoContext _ctx;
    private readonly AppInterfaces.ICurrentUser _current;

    public LoteReproductoraService(ZooSanMarinoContext ctx, AppInterfaces.ICurrentUser current)
    {
        _ctx = ctx;
        _current = current;
    }

    // ===========================
    // LISTADO (filtra por tenant)
    // ===========================
    public async Task<IEnumerable<LoteReproductoraDto>> GetAllAsync(string? loteId = null)
    {
        var q =
            from lr in _ctx.LoteReproductoras.AsNoTracking()
            join l in _ctx.Lotes.AsNoTracking() on lr.LoteId equals l.LoteId
            where l.CompanyId == _current.CompanyId && l.DeletedAt == null
            select new { lr, l };

        if (!string.IsNullOrWhiteSpace(loteId))
            q = q.Where(x => x.lr.LoteId == loteId);

        return await q
            .OrderBy(x => x.lr.LoteId).ThenBy(x => x.lr.ReproductoraId)
            .Select(x => new LoteReproductoraDto(
                x.lr.LoteId, x.lr.ReproductoraId, x.lr.NombreLote,
                x.lr.FechaEncasetamiento, x.lr.M, x.lr.H, x.lr.Mixtas,
                x.lr.MortCajaH, x.lr.MortCajaM, x.lr.UnifH, x.lr.UnifM,
                x.lr.PesoInicialM, x.lr.PesoInicialH, x.lr.PesoMixto
            ))
            .ToListAsync();
    }

    // ===========================
    // GET DETALLE (tenant-safe)
    // ===========================
    public async Task<LoteReproductoraDto?> GetByIdAsync(string loteId, string repId)
    {
        var q =
            from lr in _ctx.LoteReproductoras.AsNoTracking()
            join l in _ctx.Lotes.AsNoTracking() on lr.LoteId equals l.LoteId
            where l.CompanyId == _current.CompanyId && l.DeletedAt == null
               && lr.LoteId == loteId && lr.ReproductoraId == repId
            select lr;

        return await q
            .Select(x => new LoteReproductoraDto(
                x.LoteId, x.ReproductoraId, x.NombreLote,
                x.FechaEncasetamiento, x.M, x.H, x.Mixtas,
                x.MortCajaH, x.MortCajaM, x.UnifH, x.UnifM,
                x.PesoInicialM, x.PesoInicialH, x.PesoMixto
            ))
            .SingleOrDefaultAsync();
    }

    // ===========================
    // CREATE (valida Lote tenant)
    // ===========================
    public async Task<LoteReproductoraDto> CreateAsync(CreateLoteReproductoraDto dto)
    {
        await EnsureLoteExistsForTenant(dto.LoteId);

        // Duplicado PK compuesta
        var duplicado = await _ctx.LoteReproductoras.AsNoTracking()
            .AnyAsync(x => x.LoteId == dto.LoteId && x.ReproductoraId == dto.ReproductoraId);
        if (duplicado)
            throw new InvalidOperationException($"Ya existe {dto.LoteId}/{dto.ReproductoraId}.");

        var ent = new LoteReproductora
        {
            LoteId               = dto.LoteId,
            ReproductoraId       = dto.ReproductoraId,
            NombreLote           = dto.NombreLote,
            FechaEncasetamiento  = dto.FechaEncasetamiento,
            M                    = dto.M         ?? 0,
            H                    = dto.H         ?? 0,
            Mixtas               = dto.Mixtas    ?? 0,
            MortCajaH            = dto.MortCajaH ?? 0,
            MortCajaM            = dto.MortCajaM ?? 0,
            UnifH                = dto.UnifH     ?? 0,
            UnifM                = dto.UnifM     ?? 0,
            // Decimales: respetamos null si no viene; si quieres default 0.000, mantén el ?? 0m
            PesoInicialM         = dto.PesoInicialM,
            PesoInicialH         = dto.PesoInicialH,
            PesoMixto            = dto.PesoMixto
        };

        _ctx.LoteReproductoras.Add(ent);
        await _ctx.SaveChangesAsync();

        var created = await GetByIdAsync(ent.LoteId, ent.ReproductoraId);
        return created!; // seguro, si no lanza arriba
    }

    // ===========================
    // CREATE BULK (sin N+1)
    // ===========================
    public async Task<IEnumerable<LoteReproductoraDto>> CreateBulkAsync(IEnumerable<CreateLoteReproductoraDto> dtos)
    {
        var list = dtos?.ToList() ?? new();
        if (list.Count == 0) return Enumerable.Empty<LoteReproductoraDto>();

        var distinctLotes = list.Select(x => x.LoteId).Distinct().ToList();
        if (distinctLotes.Count != 1)
            throw new InvalidOperationException("Todos los registros bulk deben pertenecer al mismo LoteId.");

        var loteId = distinctLotes[0];
        await EnsureLoteExistsForTenant(loteId);

        // Validar duplicados existentes en una sola consulta
        var keys = list.Select(x => new { x.LoteId, x.ReproductoraId }).Distinct().ToList();

        var existing = await _ctx.LoteReproductoras.AsNoTracking()
            .Where(x => x.LoteId == loteId)
            .Select(x => new { x.LoteId, x.ReproductoraId })
            .ToListAsync();

        var existingSet = existing.Select(x => (x.LoteId, x.ReproductoraId)).ToHashSet();
        var dupKeys = keys.Where(k => existingSet.Contains((k.LoteId, k.ReproductoraId))).ToList();
        if (dupKeys.Count > 0)
        {
            var desc = string.Join(", ", dupKeys.Select(k => $"{k.LoteId}/{k.ReproductoraId}"));
            throw new InvalidOperationException($"Duplicados existentes: {desc}");
        }

        await using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            foreach (var dto in list)
            {
                var ent = new LoteReproductora
                {
                    LoteId               = dto.LoteId,
                    ReproductoraId       = dto.ReproductoraId,
                    NombreLote           = dto.NombreLote,
                    FechaEncasetamiento  = dto.FechaEncasetamiento,
                    M                    = dto.M         ?? 0,
                    H                    = dto.H         ?? 0,
                    Mixtas               = dto.Mixtas    ?? 0,
                    MortCajaH            = dto.MortCajaH ?? 0,
                    MortCajaM            = dto.MortCajaM ?? 0,
                    UnifH                = dto.UnifH     ?? 0,
                    UnifM                = dto.UnifM     ?? 0,
                    PesoInicialM         = dto.PesoInicialM,
                    PesoInicialH         = dto.PesoInicialH,
                    PesoMixto            = dto.PesoMixto
                };

                _ctx.LoteReproductoras.Add(ent);
            }

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();

            return await GetAllAsync(loteId);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ===========================
    // UPDATE (tenant-safe)
    // ===========================
    public async Task<LoteReproductoraDto?> UpdateAsync(UpdateLoteReproductoraDto dto)
    {
        // Validamos pertenencia via join con Lote
        var ent =
            await (from lr in _ctx.LoteReproductoras
                   join l in _ctx.Lotes on lr.LoteId equals l.LoteId
                   where l.CompanyId == _current.CompanyId && l.DeletedAt == null
                      && lr.LoteId == dto.LoteId && lr.ReproductoraId == dto.ReproductoraId
                   select lr).SingleOrDefaultAsync();

        if (ent is null) return null;

        ent.NombreLote          = dto.NombreLote;
        ent.FechaEncasetamiento = dto.FechaEncasetamiento;
        ent.M                   = dto.M         ?? 0;
        ent.H                   = dto.H         ?? 0;
        ent.Mixtas              = dto.Mixtas    ?? 0;
        ent.MortCajaH           = dto.MortCajaH ?? 0;
        ent.MortCajaM           = dto.MortCajaM ?? 0;
        ent.UnifH               = dto.UnifH     ?? 0;
        ent.UnifM               = dto.UnifM     ?? 0;
        ent.PesoInicialM        = dto.PesoInicialM;
        ent.PesoInicialH        = dto.PesoInicialH;
        ent.PesoMixto           = dto.PesoMixto;

        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(ent.LoteId, ent.ReproductoraId)!;
    }

    // ===========================
    // DELETE (tenant-safe)
    // ===========================
    public async Task<bool> DeleteAsync(string loteId, string repId)
    {
        var ent =
            await (from lr in _ctx.LoteReproductoras
                   join l in _ctx.Lotes on lr.LoteId equals l.LoteId
                   where l.CompanyId == _current.CompanyId && l.DeletedAt == null
                      && lr.LoteId == loteId && lr.ReproductoraId == repId
                   select lr).SingleOrDefaultAsync();

        if (ent is null) return false;

        _ctx.LoteReproductoras.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }

    // ===========================
    // Helpers
    // ===========================
    private async Task EnsureLoteExistsForTenant(string loteId)
    {
        var ok = await _ctx.Lotes.AsNoTracking()
            .AnyAsync(l => l.LoteId == loteId &&
                           l.CompanyId == _current.CompanyId &&
                           l.DeletedAt == null);
        if (!ok)
            throw new InvalidOperationException($"Lote '{loteId}' no existe o no pertenece a la compañía.");
    }
}
