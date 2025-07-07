// src/ZooSanMarino.Infrastructure/Services/LoteSeguimientoService.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class LoteSeguimientoService : ILoteSeguimientoService
{
    private readonly ZooSanMarinoContext _ctx;
    public LoteSeguimientoService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<LoteSeguimientoDto>> GetAllAsync() =>
        await _ctx.LoteSeguimientos
            .Select(x => new LoteSeguimientoDto(
                x.Id, x.Fecha, x.LoteId, x.ReproductoraId,
                x.PesoInicial, x.PesoFinal,
                x.MortalidadM, x.MortalidadH,
                x.SelM, x.SelH,
                x.ErrorM, x.ErrorH,
                x.TipoAlimento,
                x.ConsumoAlimento,
                x.Observaciones))
            .ToListAsync();

    public async Task<LoteSeguimientoDto?> GetByIdAsync(int id) =>
        await _ctx.LoteSeguimientos
            .Where(x => x.Id == id)
            .Select(x => new LoteSeguimientoDto(
                x.Id, x.Fecha, x.LoteId, x.ReproductoraId,
                x.PesoInicial, x.PesoFinal,
                x.MortalidadM, x.MortalidadH,
                x.SelM, x.SelH,
                x.ErrorM, x.ErrorH,
                x.TipoAlimento,
                x.ConsumoAlimento,
                x.Observaciones))
            .SingleOrDefaultAsync();

    public async Task<LoteSeguimientoDto> CreateAsync(CreateLoteSeguimientoDto dto)
    {
        var ent = new LoteSeguimiento {
            Fecha            = dto.Fecha,
            LoteId           = dto.LoteId,
            ReproductoraId   = dto.ReproductoraId,
            PesoInicial      = dto.PesoInicial,
            PesoFinal        = dto.PesoFinal,
            MortalidadM      = dto.MortalidadM,
            MortalidadH      = dto.MortalidadH,
            SelM             = dto.SelM,
            SelH             = dto.SelH,
            ErrorM           = dto.ErrorM,
            ErrorH           = dto.ErrorH,
            TipoAlimento     = dto.TipoAlimento,
            ConsumoAlimento  = dto.ConsumoAlimento,
            Observaciones    = dto.Observaciones
        };
        _ctx.LoteSeguimientos.Add(ent);
        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(ent.Id)!;
    }

    public async Task<LoteSeguimientoDto?> UpdateAsync(UpdateLoteSeguimientoDto dto)
    {
        var ent = await _ctx.LoteSeguimientos.FindAsync(dto.Id);
        if (ent is null) return null;

        ent.Fecha           = dto.Fecha;
        ent.LoteId          = dto.LoteId;
        ent.ReproductoraId  = dto.ReproductoraId;
        ent.PesoInicial     = dto.PesoInicial;
        ent.PesoFinal       = dto.PesoFinal;
        ent.MortalidadM     = dto.MortalidadM;
        ent.MortalidadH     = dto.MortalidadH;
        ent.SelM            = dto.SelM;
        ent.SelH            = dto.SelH;
        ent.ErrorM          = dto.ErrorM;
        ent.ErrorH          = dto.ErrorH;
        ent.TipoAlimento    = dto.TipoAlimento;
        ent.ConsumoAlimento = dto.ConsumoAlimento;
        ent.Observaciones   = dto.Observaciones;

        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(ent.Id)!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ent = await _ctx.LoteSeguimientos.FindAsync(id);
        if (ent is null) return false;
        _ctx.LoteSeguimientos.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
