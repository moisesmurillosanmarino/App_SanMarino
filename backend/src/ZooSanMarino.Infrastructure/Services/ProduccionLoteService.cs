using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class ProduccionLoteService : IProduccionLoteService
{
    private readonly ZooSanMarinoContext _ctx;
    public ProduccionLoteService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<ProduccionLoteDto> CreateAsync(CreateProduccionLoteDto dto)
    {
        var ent = new ProduccionLote
        {
            LoteId = dto.LoteId,
            FechaInicioProduccion = dto.FechaInicioProduccion,
            HembrasIniciales = dto.HembrasIniciales,
            MachosIniciales = dto.MachosIniciales,
            HuevosIniciales = dto.HuevosIniciales,
            TipoNido = dto.TipoNido,
            NucleoProduccionId = dto.NucleoProduccionId,
            GranjaId = dto.GranjaId,
            Ciclo = dto.Ciclo
        };

        _ctx.ProduccionLotes.Add(ent);
        await _ctx.SaveChangesAsync();

        return new ProduccionLoteDto(
            ent.Id, ent.LoteId, ent.FechaInicioProduccion,
            ent.HembrasIniciales, ent.MachosIniciales, ent.HuevosIniciales,
            ent.TipoNido, ent.NucleoProduccionId, ent.GranjaId, ent.Ciclo
        );
    }

    public async Task<IEnumerable<ProduccionLoteDto>> GetAllAsync() =>
        await _ctx.ProduccionLotes
            .Select(x => new ProduccionLoteDto(
                x.Id, x.LoteId, x.FechaInicioProduccion,
                x.HembrasIniciales, x.MachosIniciales, x.HuevosIniciales,
                x.TipoNido, x.NucleoProduccionId, x.GranjaId, x.Ciclo))
            .ToListAsync();

    public async Task<ProduccionLoteDto?> GetByLoteIdAsync(string loteId) =>
        await _ctx.ProduccionLotes
            .Where(x => x.LoteId == loteId)
            .Select(x => new ProduccionLoteDto(
                x.Id, x.LoteId, x.FechaInicioProduccion,
                x.HembrasIniciales, x.MachosIniciales, x.HuevosIniciales,
                x.TipoNido, x.NucleoProduccionId, x.GranjaId, x.Ciclo))
            .FirstOrDefaultAsync();

    public async Task<ProduccionLoteDto?> UpdateAsync(UpdateProduccionLoteDto dto)
    {
        var ent = await _ctx.ProduccionLotes.FindAsync(dto.Id);
        if (ent is null) return null;

        ent.FechaInicioProduccion = dto.FechaInicioProduccion;
        ent.HembrasIniciales = dto.HembrasIniciales;
        ent.MachosIniciales = dto.MachosIniciales;
        ent.HuevosIniciales = dto.HuevosIniciales;
        ent.TipoNido = dto.TipoNido;
        ent.NucleoProduccionId = dto.NucleoProduccionId;
        ent.GranjaId = dto.GranjaId;
        ent.Ciclo = dto.Ciclo;

        await _ctx.SaveChangesAsync();

        return new ProduccionLoteDto(
            ent.Id, ent.LoteId, ent.FechaInicioProduccion,
            ent.HembrasIniciales, ent.MachosIniciales, ent.HuevosIniciales,
            ent.TipoNido, ent.NucleoProduccionId, ent.GranjaId, ent.Ciclo
        );
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ent = await _ctx.ProduccionLotes.FindAsync(id);
        if (ent is null) return false;

        _ctx.ProduccionLotes.Remove(ent);
        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ProduccionLoteDto>> FilterAsync(FilterProduccionLoteDto filter)
    {
        var query = _ctx.ProduccionLotes.AsQueryable();

        if (!string.IsNullOrEmpty(filter.LoteId))
            query = query.Where(x => x.LoteId == filter.LoteId);

        if (filter.Desde.HasValue)
            query = query.Where(x => x.FechaInicioProduccion >= filter.Desde.Value);

        if (filter.Hasta.HasValue)
            query = query.Where(x => x.FechaInicioProduccion <= filter.Hasta.Value);

        return await query
            .Select(x => new ProduccionLoteDto(
                x.Id, x.LoteId, x.FechaInicioProduccion,
                x.HembrasIniciales, x.MachosIniciales, x.HuevosIniciales,
                x.TipoNido, x.NucleoProduccionId, x.GranjaId, x.Ciclo))
            .ToListAsync();
    }
}
