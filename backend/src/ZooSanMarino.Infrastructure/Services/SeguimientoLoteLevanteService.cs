using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class SeguimientoLoteLevanteService : ISeguimientoLoteLevanteService
{
    private readonly ZooSanMarinoContext _ctx;
    public SeguimientoLoteLevanteService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<SeguimientoLoteLevanteDto>> GetByLoteAsync(string loteId) =>
        await _ctx.SeguimientoLoteLevante
            .Where(x => x.LoteId == loteId)
            .Select(x => new SeguimientoLoteLevanteDto(
                x.Id,
                x.LoteId,
                x.FechaRegistro,
                x.MortalidadHembras,
                x.MortalidadMachos,
                x.SelH,
                x.SelM,
                x.ErrorSexajeHembras,
                x.ErrorSexajeMachos,
                x.ConsumoKgHembras,
                x.TipoAlimento,
                x.Observaciones,
                x.KcalAlH,
                x.ProtAlH,
                x.KcalAveH,
                x.ProtAveH,
                x.Ciclo))
            .ToListAsync();

    public async Task<SeguimientoLoteLevanteDto> CreateAsync(SeguimientoLoteLevanteDto dto)
    {
        var ent = new SeguimientoLoteLevante
        {
            LoteId = dto.LoteId,
            FechaRegistro = dto.FechaRegistro,
            MortalidadHembras = dto.MortalidadHembras,
            MortalidadMachos = dto.MortalidadMachos,
            SelH = dto.SelH,
            SelM = dto.SelM,
            ErrorSexajeHembras = dto.ErrorSexajeHembras,
            ErrorSexajeMachos = dto.ErrorSexajeMachos,
            ConsumoKgHembras = dto.ConsumoKgHembras,
            TipoAlimento = dto.TipoAlimento,
            Observaciones = dto.Observaciones,
            KcalAlH = dto.KcalAlH,
            ProtAlH = dto.ProtAlH,
            KcalAveH = dto.KcalAveH,
            ProtAveH = dto.ProtAveH,
            Ciclo = dto.Ciclo
        };

        _ctx.SeguimientoLoteLevante.Add(ent);
        await _ctx.SaveChangesAsync();

        return await _ctx.SeguimientoLoteLevante
            .Where(x => x.Id == ent.Id)
            .Select(x => new SeguimientoLoteLevanteDto(
                x.Id,
                x.LoteId,
                x.FechaRegistro,
                x.MortalidadHembras,
                x.MortalidadMachos,
                x.SelH,
                x.SelM,
                x.ErrorSexajeHembras,
                x.ErrorSexajeMachos,
                x.ConsumoKgHembras,
                x.TipoAlimento,
                x.Observaciones,
                x.KcalAlH,
                x.ProtAlH,
                x.KcalAveH,
                x.ProtAveH,
                x.Ciclo))
            .SingleAsync();
    }
    public async Task<SeguimientoLoteLevanteDto?> UpdateAsync(SeguimientoLoteLevanteDto dto)
{
    var ent = await _ctx.SeguimientoLoteLevante.FindAsync(dto.Id);
    if (ent is null) return null;

    ent.FechaRegistro = dto.FechaRegistro;
    ent.MortalidadHembras = dto.MortalidadHembras;
    ent.MortalidadMachos = dto.MortalidadMachos;
    ent.SelH = dto.SelH;
    ent.SelM = dto.SelM;
    ent.ErrorSexajeHembras = dto.ErrorSexajeHembras;
    ent.ErrorSexajeMachos = dto.ErrorSexajeMachos;
    ent.ConsumoKgHembras = dto.ConsumoKgHembras;
    ent.TipoAlimento = dto.TipoAlimento;
    ent.Observaciones = dto.Observaciones;
    ent.KcalAlH = dto.KcalAlH;
    ent.ProtAlH = dto.ProtAlH;
    ent.KcalAveH = dto.KcalAveH;
    ent.ProtAveH = dto.ProtAveH;
    ent.Ciclo = dto.Ciclo;

    await _ctx.SaveChangesAsync();
    return dto;
}

public async Task<bool> DeleteAsync(int id)
{
    var ent = await _ctx.SeguimientoLoteLevante.FindAsync(id);
    if (ent is null) return false;

    _ctx.SeguimientoLoteLevante.Remove(ent);
    await _ctx.SaveChangesAsync();
    return true;
}

public async Task<IEnumerable<SeguimientoLoteLevanteDto>> FilterAsync(string? loteId, DateTime? desde, DateTime? hasta)
{
    var query = _ctx.SeguimientoLoteLevante.AsQueryable();

    if (!string.IsNullOrEmpty(loteId))
        query = query.Where(x => x.LoteId == loteId);

    if (desde.HasValue)
        query = query.Where(x => x.FechaRegistro >= desde.Value);

    if (hasta.HasValue)
        query = query.Where(x => x.FechaRegistro <= hasta.Value);

    return await query
        .Select(x => new SeguimientoLoteLevanteDto(
            x.Id,
            x.LoteId,
            x.FechaRegistro,
            x.MortalidadHembras,
            x.MortalidadMachos,
            x.SelH,
            x.SelM,
            x.ErrorSexajeHembras,
            x.ErrorSexajeMachos,
            x.ConsumoKgHembras,
            x.TipoAlimento,
            x.Observaciones,
            x.KcalAlH,
            x.ProtAlH,
            x.KcalAveH,
            x.ProtAveH,
            x.Ciclo))
        .ToListAsync();
}

}
