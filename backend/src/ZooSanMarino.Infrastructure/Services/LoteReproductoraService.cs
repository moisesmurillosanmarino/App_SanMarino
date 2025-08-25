using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class LoteReproductoraService : ILoteReproductoraService
{
    private readonly ZooSanMarinoContext _ctx;
    public LoteReproductoraService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<LoteReproductoraDto>> GetAllAsync(string? loteId = null)
    {
        var q = _ctx.LoteReproductoras.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(loteId)) q = q.Where(x => x.LoteId == loteId);

        return await q.Select(x => new LoteReproductoraDto(
                x.LoteId, x.ReproductoraId, x.NombreLote,
                x.FechaEncasetamiento, x.M, x.H, x.Mixtas,
                x.MortCajaH, x.MortCajaM, x.UnifH, x.UnifM,
                x.PesoInicialM, x.PesoInicialH, x.PesoMixto
            ))
            .ToListAsync();
    }

    public async Task<LoteReproductoraDto?> GetByIdAsync(string loteId, string repId) =>
        await _ctx.LoteReproductoras.AsNoTracking()
            .Where(x => x.LoteId == loteId && x.ReproductoraId == repId)
            .Select(x => new LoteReproductoraDto(
                x.LoteId, x.ReproductoraId, x.NombreLote,
                x.FechaEncasetamiento, x.M, x.H, x.Mixtas,
                x.MortCajaH, x.MortCajaM, x.UnifH, x.UnifM,
                x.PesoInicialM, x.PesoInicialH, x.PesoMixto
            ))
            .SingleOrDefaultAsync();

    public async Task<LoteReproductoraDto> CreateAsync(CreateLoteReproductoraDto dto)
    {
        var ent = new LoteReproductora {
            LoteId = dto.LoteId,
            ReproductoraId = dto.ReproductoraId,
            NombreLote = dto.NombreLote,
            FechaEncasetamiento = dto.FechaEncasetamiento,
            M = dto.M ?? 0,
            H = dto.H ?? 0,
            Mixtas = dto.Mixtas ?? 0,
            MortCajaH = dto.MortCajaH ?? 0,
            MortCajaM = dto.MortCajaM ?? 0,
            UnifH = dto.UnifH ?? 0,
            UnifM = dto.UnifM ?? 0,
            PesoInicialM = dto.PesoInicialM ?? 0,
            PesoInicialH = dto.PesoInicialH ?? 0,
            PesoMixto = dto.PesoMixto
        };

        _ctx.LoteReproductoras.Add(ent);
        await _ctx.SaveChangesAsync();

        return (await GetByIdAsync(ent.LoteId, ent.ReproductoraId))!;
    }

    public async Task<IEnumerable<LoteReproductoraDto>> CreateBulkAsync(IEnumerable<CreateLoteReproductoraDto> dtos)
    {
        var list = dtos?.ToList() ?? new();
        if (list.Count == 0) return Enumerable.Empty<LoteReproductoraDto>();

        var distinctLotes = list.Select(x => x.LoteId).Distinct().ToList();
        if (distinctLotes.Count != 1)
            throw new InvalidOperationException("Todos los registros bulk deben pertenecer al mismo LoteId.");

        await using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            foreach (var dto in list)
            {
                var exists = await _ctx.LoteReproductoras
                    .AnyAsync(x => x.LoteId == dto.LoteId && x.ReproductoraId == dto.ReproductoraId);

                if (exists)
                    throw new InvalidOperationException($"Duplicado: {dto.LoteId}/{dto.ReproductoraId}");

                var ent = new LoteReproductora {
                    LoteId = dto.LoteId,
                    ReproductoraId = dto.ReproductoraId,
                    NombreLote = dto.NombreLote,
                    FechaEncasetamiento = dto.FechaEncasetamiento,
                    M = dto.M ?? 0,
                    H = dto.H ?? 0,
                    Mixtas = dto.Mixtas ?? 0,
                    MortCajaH = dto.MortCajaH ?? 0,
                    MortCajaM = dto.MortCajaM ?? 0,
                    UnifH = dto.UnifH ?? 0,
                    UnifM = dto.UnifM ?? 0,
                    PesoInicialM = dto.PesoInicialM ?? 0,
                    PesoInicialH = dto.PesoInicialH ?? 0,
                    PesoMixto = dto.PesoMixto
                };

                _ctx.LoteReproductoras.Add(ent);
            }

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();

            return await GetAllAsync(distinctLotes[0]);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<LoteReproductoraDto?> UpdateAsync(UpdateLoteReproductoraDto dto)
    {
        var ent = await _ctx.LoteReproductoras.FindAsync(dto.LoteId, dto.ReproductoraId);
        if (ent is null) return null;

        ent.NombreLote = dto.NombreLote;
        ent.FechaEncasetamiento = dto.FechaEncasetamiento;
        ent.M = dto.M ?? 0;
        ent.H = dto.H ?? 0;
        ent.Mixtas = dto.Mixtas ?? 0;
        ent.MortCajaH = dto.MortCajaH ?? 0;
        ent.MortCajaM = dto.MortCajaM ?? 0;
        ent.UnifH = dto.UnifH ?? 0;
        ent.UnifM = dto.UnifM ?? 0;
        ent.PesoInicialM = dto.PesoInicialM ?? 0;
        ent.PesoInicialH = dto.PesoInicialH ?? 0;
        ent.PesoMixto = dto.PesoMixto;

        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(ent.LoteId, ent.ReproductoraId)!;
    }

    public async Task<bool> DeleteAsync(string loteId, string repId)
    {
        var ent = await _ctx.LoteReproductoras.FindAsync(loteId, repId);
        if (ent is null) return false;

        _ctx.LoteReproductoras.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
