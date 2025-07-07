using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class GalponService : IGalponService
{
    private readonly ZooSanMarinoContext _ctx;
    public GalponService(ZooSanMarinoContext ctx) => _ctx = ctx;
 

  public async Task<IEnumerable<GalponDto>> GetAllAsync() =>
      await _ctx.Galpones
          .Select(g => new GalponDto(
              g.GalponId,
              g.GalponNombre,
              g.GalponNucleoId,
              g.GranjaId,
              g.Ancho,
              g.Largo,
              g.TipoGalpon
          ))
          .ToListAsync();

    public async Task<GalponDto?> GetByIdAsync(string galponId) =>
        await _ctx.Galpones
            .Where(g => g.GalponId == galponId)
            .Select(g => new GalponDto(
                g.GalponId,
                g.GalponNombre,
                g.GalponNucleoId,
                g.GranjaId,
                g.Ancho,
                g.Largo,
                g.TipoGalpon
            ))
            .SingleOrDefaultAsync();

    public async Task<GalponDto> CreateAsync(CreateGalponDto dto)
    {
        var ent = new Galpon
        {
            GalponId       = dto.GalponId,
            GalponNombre   = dto.GalponNombre,
            GalponNucleoId = dto.GalponNucleoId,
            GranjaId       = dto.GranjaId,
            Ancho          = dto.Ancho,
            Largo          = dto.Largo,
            TipoGalpon     = dto.TipoGalpon
        };
        _ctx.Galpones.Add(ent);
        await _ctx.SaveChangesAsync();

        return new GalponDto(
            ent.GalponId,
            ent.GalponNombre,
            ent.GalponNucleoId,
            ent.GranjaId,
            ent.Ancho,
            ent.Largo,
            ent.TipoGalpon
        );
    }

    public async Task<GalponDto?> UpdateAsync(UpdateGalponDto dto)
    {
        var ent = await _ctx.Galpones.FindAsync(dto.GalponId);
        if (ent is null) return null;

        ent.GalponNombre   = dto.GalponNombre;
        ent.GalponNucleoId = dto.GalponNucleoId;
        ent.GranjaId       = dto.GranjaId;
        ent.Ancho          = dto.Ancho;
        ent.Largo          = dto.Largo;
        ent.TipoGalpon     = dto.TipoGalpon;

        await _ctx.SaveChangesAsync();

        return new GalponDto(
            ent.GalponId,
            ent.GalponNombre,
            ent.GalponNucleoId,
            ent.GranjaId,
            ent.Ancho,
            ent.Largo,
            ent.TipoGalpon
        );
    }

    public async Task<bool> DeleteAsync(string galponId)
    {
        var ent = await _ctx.Galpones.FindAsync(galponId);
        if (ent is null) return false;

        _ctx.Galpones.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<GalponDto>> GetByGranjaAndNucleoAsync(int granjaId, string nucleoId) =>
        await _ctx.Galpones
            .Where(g => g.GranjaId == granjaId && g.GalponNucleoId == nucleoId)
            .Select(g => new GalponDto(
                g.GalponId,
                g.GalponNombre,
                g.GalponNucleoId,
                g.GranjaId,
                g.Ancho,
                g.Largo,
                g.TipoGalpon
            ))
            .ToListAsync();
}
