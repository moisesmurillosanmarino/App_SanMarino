// src/ZooSanMarino.Infrastructure/Services/LoteService.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class LoteService : ILoteService
{
    private readonly ZooSanMarinoContext _ctx;
    public LoteService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<LoteDto>> GetAllAsync() =>
        await _ctx.Lotes
            .Select(x => new LoteDto(
                x.LoteId,
                x.LoteNombre,
                x.GranjaId,
                x.NucleoId,
                x.GalponId,
                x.Regional,
                x.FechaEncaset,
                x.HembrasL,
                x.MachosL,
                x.PesoInicialH,
                x.PesoInicialM,
                x.UnifH,
                x.UnifM,
                x.MortCajaH,
                x.MortCajaM,
                x.Raza,
                x.AnoTablaGenetica,
                x.Linea,
                x.TipoLinea,
                x.CodigoGuiaGenetica,
                x.Tecnico))
            .ToListAsync();

    public async Task<LoteDto?> GetByIdAsync(string loteId) =>
        await _ctx.Lotes
            .Where(x => x.LoteId == loteId)
            .Select(x => new LoteDto(
                x.LoteId,
                x.LoteNombre,
                x.GranjaId,
                x.NucleoId,
                x.GalponId,
                x.Regional,
                x.FechaEncaset,
                x.HembrasL,
                x.MachosL,
                x.PesoInicialH,
                x.PesoInicialM,
                x.UnifH,
                x.UnifM,
                x.MortCajaH,
                x.MortCajaM,
                x.Raza,
                x.AnoTablaGenetica,
                x.Linea,
                x.TipoLinea,
                x.CodigoGuiaGenetica,
                x.Tecnico))
            .SingleOrDefaultAsync();

    public async Task<LoteDto> CreateAsync(CreateLoteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.LoteId))
            throw new InvalidOperationException("LoteId no puede ser null.");
        var ent = new Lote
        {
            LoteId             = dto.LoteId,
            LoteNombre         = dto.LoteNombre,
            GranjaId           = dto.GranjaId,
            NucleoId           = dto.NucleoId,
            GalponId           = dto.GalponId,
            Regional           = dto.Regional,
            FechaEncaset       = dto.FechaEncaset,
            HembrasL           = dto.HembrasL,
            MachosL            = dto.MachosL,
            PesoInicialH       = dto.PesoInicialH,
            PesoInicialM       = dto.PesoInicialM,
            UnifH              = dto.UnifH,
            UnifM              = dto.UnifM,
            MortCajaH          = dto.MortCajaH,
            MortCajaM          = dto.MortCajaM,
            Raza               = dto.Raza,
            AnoTablaGenetica   = dto.AnoTablaGenetica,
            Linea              = dto.Linea,
            TipoLinea          = dto.TipoLinea,
            CodigoGuiaGenetica = dto.CodigoGuiaGenetica,
            Tecnico            = dto.Tecnico
        };
        _ctx.Lotes.Add(ent);
        await _ctx.SaveChangesAsync();
        var result = await GetByIdAsync(ent.LoteId);
        if (result is null) throw new InvalidOperationException("Lote not found after creation.");
        return result;
    }

    public async Task<LoteDto?> UpdateAsync(UpdateLoteDto dto)
    {
        var ent = await _ctx.Lotes.FindAsync(dto.LoteId);
        if (ent is null) return null;

        ent.LoteNombre         = dto.LoteNombre;
        ent.GranjaId           = dto.GranjaId;
        ent.NucleoId           = dto.NucleoId;
        ent.GalponId           = dto.GalponId;
        ent.Regional           = dto.Regional;
        ent.FechaEncaset       = dto.FechaEncaset;
        ent.HembrasL           = dto.HembrasL;
        ent.MachosL            = dto.MachosL;
        ent.PesoInicialH       = dto.PesoInicialH;
        ent.PesoInicialM       = dto.PesoInicialM;
        ent.UnifH              = dto.UnifH;
        ent.UnifM              = dto.UnifM;
        ent.MortCajaH          = dto.MortCajaH;
        ent.MortCajaM          = dto.MortCajaM;
        ent.Raza               = dto.Raza;
        ent.AnoTablaGenetica   = dto.AnoTablaGenetica;
        ent.Linea              = dto.Linea;
        ent.TipoLinea          = dto.TipoLinea;
        ent.CodigoGuiaGenetica = dto.CodigoGuiaGenetica;
        ent.Tecnico            = dto.Tecnico;

        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(ent.LoteId)!;
    }
 
    public async Task<bool> DeleteAsync(string loteId)
    {
        var ent = await _ctx.Lotes.FindAsync(loteId);
        if (ent is null) return false;

        _ctx.Lotes.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
