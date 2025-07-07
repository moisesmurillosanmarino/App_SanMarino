// src/ZooSanMarino.Infrastructure/Services/FarmService.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;
public class FarmService : IFarmService
{
    private readonly ZooSanMarinoContext _ctx;
    public FarmService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<FarmDto>> GetAllAsync() =>
        await _ctx.Farms
            .Select(f => new FarmDto(
                f.Id, f.CompanyId, f.Name,
                f.RegionalId, f.Status, f.ZoneId))
            .ToListAsync();

    public async Task<FarmDto?> GetByIdAsync(int id) =>
        await _ctx.Farms
            .Where(f => f.Id == id)
            .Select(f => new FarmDto(
                f.Id, f.CompanyId, f.Name,
                f.RegionalId, f.Status, f.ZoneId))
            .SingleOrDefaultAsync();

    public async Task<FarmDto> CreateAsync(CreateFarmDto dto)
    {
        var entity = new Farm
        {
            CompanyId  = dto.CompanyId,
            Name       = dto.Name,
            RegionalId = dto.RegionalId,
            Status     = dto.Status,
            ZoneId     = dto.ZoneId
        };
        _ctx.Farms.Add(entity);
        await _ctx.SaveChangesAsync();
        return new FarmDto(
            entity.Id, entity.CompanyId,
            entity.Name, entity.RegionalId,
            entity.Status, entity.ZoneId);
    }

    public async Task<FarmDto?> UpdateAsync(UpdateFarmDto dto)
    {
        var entity = await _ctx.Farms.FindAsync(dto.Id);
        if (entity is null) return null;
        entity.CompanyId  = dto.CompanyId;
        entity.Name       = dto.Name;
        entity.RegionalId = dto.RegionalId;
        entity.Status     = dto.Status;
        entity.ZoneId     = dto.ZoneId;
        await _ctx.SaveChangesAsync();
        return new FarmDto(
            entity.Id, entity.CompanyId,
            entity.Name, entity.RegionalId,
            entity.Status, entity.ZoneId);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _ctx.Farms.FindAsync(id);
        if (entity is null) return false;
        _ctx.Farms.Remove(entity);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
