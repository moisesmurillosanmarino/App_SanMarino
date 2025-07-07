// src/ZooSanMarino.Infrastructure/Services/NucleoService.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;
public class NucleoService : INucleoService
{
    readonly ZooSanMarinoContext _ctx;
    public NucleoService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<NucleoDto>> GetAllAsync() =>
      await _ctx.Nucleos
        .Select(n => new NucleoDto(n.NucleoId, n.GranjaId, n.NucleoNombre))
        .ToListAsync();

    public async Task<NucleoDto?> GetByIdAsync(string nucleoId, int granjaId) =>
      await _ctx.Nucleos
        .Where(n => n.NucleoId == nucleoId && n.GranjaId == granjaId)
        .Select(n => new NucleoDto(n.NucleoId, n.GranjaId, n.NucleoNombre))
        .SingleOrDefaultAsync();

    public async Task<NucleoDto> CreateAsync(CreateNucleoDto dto)
    {
      var ent = new Nucleo {
        NucleoId     = dto.NucleoId,
        GranjaId     = dto.GranjaId,
        NucleoNombre = dto.NucleoNombre
      };
      _ctx.Nucleos.Add(ent);
      await _ctx.SaveChangesAsync();
      return new NucleoDto(ent.NucleoId, ent.GranjaId, ent.NucleoNombre);
    }

    public async Task<NucleoDto?> UpdateAsync(UpdateNucleoDto dto)
    {
      var ent = await _ctx.Nucleos
                  .FindAsync(dto.NucleoId, dto.GranjaId);
      if (ent is null) return null;
      ent.NucleoNombre = dto.NucleoNombre;
      await _ctx.SaveChangesAsync();
      return new NucleoDto(ent.NucleoId, ent.GranjaId, ent.NucleoNombre);
    }

    public async Task<bool> DeleteAsync(string nucleoId, int granjaId)
    {
      var ent = await _ctx.Nucleos.FindAsync(nucleoId, granjaId);
      if (ent is null) return false;
      _ctx.Nucleos.Remove(ent);
      await _ctx.SaveChangesAsync();
      return true;
    }
}
