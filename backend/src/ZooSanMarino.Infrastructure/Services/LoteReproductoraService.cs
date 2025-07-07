// src/ZooSanMarino.Infrastructure/Services/LoteReproductoraService.cs
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

    public async Task<IEnumerable<LoteReproductoraDto>> GetAllAsync() =>
        await _ctx.LoteReproductoras
            .Select(x => new LoteReproductoraDto(
            x.LoteId, x.ReproductoraId, x.NombreLote,
            x.FechaEncasetamiento, x.M, x.H,
            x.MortCajaH, x.MortCajaM,
            x.UnifH, x.UnifM,
            x.PesoInicialM, x.PesoInicialH))
            .ToListAsync();

    public async Task<LoteReproductoraDto?> GetByIdAsync(string loteId, string repId) =>
        await _ctx.LoteReproductoras
            .Where(x => x.LoteId == loteId && x.ReproductoraId == repId)
            .Select(x => new LoteReproductoraDto(
            x.LoteId, x.ReproductoraId, x.NombreLote,
            x.FechaEncasetamiento, x.M, x.H,
            x.MortCajaH, x.MortCajaM,
            x.UnifH, x.UnifM,
            x.PesoInicialM, x.PesoInicialH))
            .SingleOrDefaultAsync();

    public async Task<LoteReproductoraDto> CreateAsync(CreateLoteReproductoraDto dto)
    {
       var ent = new LoteReproductora {
        LoteId               = dto.LoteId,
        ReproductoraId       = dto.ReproductoraId,
        NombreLote           = dto.NombreLote,
        FechaEncasetamiento  = dto.FechaEncasetamiento,
        M                    = dto.M,
        H                    = dto.H,
        MortCajaH            = dto.MortCajaH,
        MortCajaM            = dto.MortCajaM,
        UnifH                = dto.UnifH,
        UnifM                = dto.UnifM,
        PesoInicialM         = dto.PesoInicialM,
        PesoInicialH         = dto.PesoInicialH
    };
        _ctx.LoteReproductoras.Add(ent);
        await _ctx.SaveChangesAsync();
        var result = await GetByIdAsync(ent.LoteId, ent.ReproductoraId);
        if (result is null)
        {
            throw new InvalidOperationException("Failed to retrieve the created LoteReproductora.");
        }
        return result;
    }

    public async Task<LoteReproductoraDto?> UpdateAsync(UpdateLoteReproductoraDto dto)
    {
        var ent = await _ctx.LoteReproductoras.FindAsync(dto.LoteId, dto.ReproductoraId);
        if (ent is null) return null;

        ent.NombreLote           = dto.NombreLote;
        ent.FechaEncasetamiento  = dto.FechaEncasetamiento;
        ent.M                    = dto.M;
        ent.H                    = dto.H;
        ent.MortCajaH            = dto.MortCajaH;
        ent.MortCajaM            = dto.MortCajaM;
        ent.UnifH                = dto.UnifH;
        ent.UnifM                = dto.UnifM;
        ent.PesoInicialM         = dto.PesoInicialM;
        ent.PesoInicialH         = dto.PesoInicialH;

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
