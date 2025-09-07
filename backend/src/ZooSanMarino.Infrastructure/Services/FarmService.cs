// src/ZooSanMarino.Infrastructure/Services/FarmService.cs
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

using ZooSanMarino.Application.DTOs;                          // FarmDto, Create/Update
using AppInterfaces = ZooSanMarino.Application.Interfaces;   // IFarmService, ICurrentUser
using CommonDtos   = ZooSanMarino.Application.DTOs.Common;   // PagedResult<>
using FarmDtos     = ZooSanMarino.Application.DTOs.Farms;    // Farm* DTOs (Tree, Detail, Search)
using FarmLiteDto  = ZooSanMarino.Application.DTOs.Shared.FarmLiteDto;

using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services
{
    public class FarmService : AppInterfaces.IFarmService
    {
        private readonly ZooSanMarinoContext _ctx;
        private readonly AppInterfaces.ICurrentUser _current;

        public FarmService(ZooSanMarinoContext ctx, AppInterfaces.ICurrentUser current)
        {
            _ctx = ctx;
            _current = current;
        }

        // ======================================================
        // BÚSQUEDA / LISTADO AVANZADO
        // ======================================================
        public async Task<CommonDtos.PagedResult<FarmDtos.FarmDetailDto>> SearchAsync(FarmDtos.FarmSearchRequest req)
        {
            var q = _ctx.Farms
                .AsNoTracking()
                .Where(f => f.CompanyId == _current.CompanyId);

            if (req.SoloActivos) q = q.Where(f => f.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                var term = req.Search.Trim().ToLower();
                q = q.Where(f =>
                    f.Name.ToLower().Contains(term) ||
                    f.Id.ToString().Contains(req.Search!.Trim())
                );
                // Npgsql tip: EF.Functions.ILike(f.Name, $"%{req.Search}%")
            }

            if (req.RegionalId.HasValue)      q = q.Where(f => f.RegionalId     == req.RegionalId.Value);
            if (req.DepartamentoId.HasValue)  q = q.Where(f => f.DepartamentoId == req.DepartamentoId.Value);
            if (req.CiudadId.HasValue)        q = q.Where(f => f.MunicipioId    == req.CiudadId.Value); // ← mapea filtro ciudad → municipio
            if (!string.IsNullOrWhiteSpace(req.Status)) q = q.Where(f => f.Status == req.Status);

            q = ApplyOrder(q, req.SortBy, req.SortDesc);

            var total = await q.LongCountAsync();
            var items = await ProjectToDetail(q)
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .ToListAsync();

            return new CommonDtos.PagedResult<FarmDtos.FarmDetailDto>
            {
                Page = req.Page,
                PageSize = req.PageSize,
                Total = total,
                Items = items
            };
        }

        // ======================================================
        // DETALLE
        // ======================================================
        public async Task<FarmDtos.FarmDetailDto?> GetDetailByIdAsync(int id)
        {
            var q = _ctx.Farms
                .AsNoTracking()
                .Where(f => f.CompanyId == _current.CompanyId && f.Id == id && f.DeletedAt == null);

            return await ProjectToDetail(q).SingleOrDefaultAsync();
        }

        // ======================================================
        // ÁRBOL para cascadas (Farm → Núcleos → Galpones)
        // ======================================================
        public async Task<FarmDtos.FarmTreeDto?> GetTreeByIdAsync(int farmId, bool soloActivos = true)
        {
            var farm = await _ctx.Farms
                .AsNoTracking()
                .Where(f => f.CompanyId == _current.CompanyId
                         && f.Id == farmId
                         && (!soloActivos || f.DeletedAt == null))
                .Select(f => new FarmLiteDto(
                    f.Id,
                    f.Name,
                    f.RegionalId,
                    f.DepartamentoId,
                    f.MunicipioId // ← expuesto como ciudadId en el DTO de Front si tu FarmLiteDto lo nombra así
                ))
                .SingleOrDefaultAsync();

            if (farm is null) return null;

            var nucleos = await _ctx.Nucleos
                .AsNoTracking()
                .Where(n => n.GranjaId == farmId
                         && (!soloActivos || n.DeletedAt == null))
                .Select(n => new FarmDtos.NucleoNodeDto(
                    n.NucleoId,
                    n.GranjaId,
                    n.NucleoNombre,
                    _ctx.Galpones.Count(g =>
                        g.NucleoId == n.NucleoId &&
                        g.GranjaId == n.GranjaId &&
                        (!soloActivos || g.DeletedAt == null)
                    ),
                    _ctx.Lotes.Count(l =>
                        l.NucleoId == n.NucleoId &&
                        l.GranjaId == n.GranjaId &&
                        (!soloActivos || l.DeletedAt == null)
                    )
                ))
                .OrderBy(n => n.NucleoNombre)
                .ToListAsync();

            return new FarmDtos.FarmTreeDto(farm, nucleos);
        }

        // ======================================================
        // CRUD BÁSICO (compat)
        // ======================================================
        public async Task<IEnumerable<FarmDto>> GetAllAsync() =>
            await _ctx.Farms
                .AsNoTracking()
                .Where(f => f.CompanyId == _current.CompanyId && f.DeletedAt == null)
                .Select(f => new FarmDto(
                    f.Id,
                    f.CompanyId,
                    f.Name,
                    f.RegionalId,
                    f.Status,
                    f.DepartamentoId,
                    f.MunicipioId // ← mapea a CiudadId del DTO
                ))
                .ToListAsync();

        public async Task<FarmDto?> GetByIdAsync(int id) =>
            await _ctx.Farms
                .AsNoTracking()
                .Where(f => f.CompanyId == _current.CompanyId && f.DeletedAt == null && f.Id == id)
                .Select(f => new FarmDto(
                    f.Id,
                    f.CompanyId,
                    f.Name,
                    f.RegionalId,
                    f.Status,
                    f.DepartamentoId,
                    f.MunicipioId // ← mapea a CiudadId del DTO
                ))
                .SingleOrDefaultAsync();

        public async Task<FarmDto> CreateAsync(CreateFarmDto dto)
        {
            var dup = await _ctx.Farms
                .AsNoTracking()
                .AnyAsync(f => f.CompanyId == _current.CompanyId &&
                               f.Name.ToLower() == dto.Name.Trim().ToLower() &&
                               f.DeletedAt == null);
            if (dup) throw new InvalidOperationException("Ya existe una granja con ese nombre en la compañía.");

            var entity = new Farm
            {
                CompanyId       = _current.CompanyId,
                Name            = dto.Name.Trim(),
                RegionalId      = dto.RegionalId,
                Status          = dto.Status,
                DepartamentoId  = dto.DepartamentoId,
                MunicipioId     = dto.CiudadId, // ← DTO llega como ciudadId
                CreatedByUserId = _current.UserId,
                CreatedAt       = DateTime.UtcNow
            };

            _ctx.Farms.Add(entity);
            await _ctx.SaveChangesAsync();

            return new FarmDto(
                entity.Id,
                entity.CompanyId,
                entity.Name,
                entity.RegionalId,
                entity.Status,
                entity.DepartamentoId,
                entity.MunicipioId // ← a CiudadId del DTO
            );
        }

        public async Task<FarmDto?> UpdateAsync(UpdateFarmDto dto)
        {
            var entity = await _ctx.Farms
                .SingleOrDefaultAsync(f => f.Id == dto.Id && f.CompanyId == _current.CompanyId);

            if (entity is null || entity.DeletedAt != null) return null;

            if (!string.Equals(entity.Name, dto.Name, StringComparison.OrdinalIgnoreCase))
            {
                var dup = await _ctx.Farms
                    .AsNoTracking()
                    .AnyAsync(f => f.CompanyId == _current.CompanyId &&
                                   f.Id != dto.Id &&
                                   f.Name.ToLower() == dto.Name.Trim().ToLower() &&
                                   f.DeletedAt == null);
                if (dup) throw new InvalidOperationException("Ya existe otra granja con ese nombre en la compañía.");
            }

            entity.Name           = dto.Name.Trim();
            entity.RegionalId     = dto.RegionalId;
            entity.Status         = dto.Status;
            entity.DepartamentoId = dto.DepartamentoId;
            entity.MunicipioId    = dto.CiudadId; // ← DTO ciudadId → entidad MunicipioId
            entity.UpdatedByUserId= _current.UserId;
            entity.UpdatedAt      = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();

            return new FarmDto(
                entity.Id,
                entity.CompanyId,
                entity.Name,
                entity.RegionalId,
                entity.Status,
                entity.DepartamentoId,
                entity.MunicipioId // ← a CiudadId del DTO
            );
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _ctx.Farms
                .SingleOrDefaultAsync(f => f.Id == id && f.CompanyId == _current.CompanyId);
            if (entity is null || entity.DeletedAt != null) return false;

            entity.DeletedAt       = DateTime.UtcNow;
            entity.UpdatedByUserId = _current.UserId;
            entity.UpdatedAt       = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            var entity = await _ctx.Farms
                .SingleOrDefaultAsync(f => f.Id == id && f.CompanyId == _current.CompanyId);
            if (entity is null) return false;

            _ctx.Farms.Remove(entity);
            await _ctx.SaveChangesAsync();
            return true;
        }

        // ======================================================
        // Helpers
        // ======================================================
        private static IQueryable<FarmDtos.FarmDetailDto> ProjectToDetail(IQueryable<Farm> q)
        {
            return q.Select(f => new FarmDtos.FarmDetailDto(
                f.Id,
                f.CompanyId,
                f.Name,
                f.RegionalId,
                f.Status,
                f.DepartamentoId,
                f.MunicipioId, // ← a CiudadId del DTO de detalle
                f.CreatedByUserId,
                f.CreatedAt,
                f.UpdatedByUserId,
                f.UpdatedAt,
                f.Nucleos.Count(),
                f.Nucleos.SelectMany(n => n.Galpones).Count(),
                f.Lotes.Count()
            ));
        }

        private static IQueryable<Farm> ApplyOrder(IQueryable<Farm> q, string sortBy, bool desc)
        {
            Expression<Func<Farm, object>> key = (sortBy ?? "").ToLower() switch
            {
                "name"             => f => f.Name,
                "regional_id"      => f => f.RegionalId,
                "departamento_id"  => f => f.DepartamentoId,
                "ciudad_id"        => f => f.MunicipioId, // ← orden por ciudad = municipio
                "created_at"       => f => f.CreatedAt,
                _                  => f => f.Name
            };
            return desc ? q.OrderByDescending(key) : q.OrderBy(key);
        }
    }
}
