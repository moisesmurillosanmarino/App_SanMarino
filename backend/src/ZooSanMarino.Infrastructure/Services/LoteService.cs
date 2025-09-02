// file: src/ZooSanMarino.Infrastructure/Services/LoteService.cs
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

using ZooSanMarino.Application.DTOs;           // LoteDto, Create/Update
using ZooSanMarino.Application.DTOs.Lotes;     // LoteDetailDto, LoteSearchRequest

// 👇 Alias para evitar ambigüedad con PagedResult<>
using CommonDtos = ZooSanMarino.Application.DTOs.Common;
// 👇 Alias para usar SIEMPRE la ICurrentUser de Application
using AppInterfaces = ZooSanMarino.Application.Interfaces;
using LoteDtos = ZooSanMarino.Application.DTOs.Lotes;

// 👇 Lite DTOs centralizados en Shared
using FarmLiteDto   = ZooSanMarino.Application.DTOs.Shared.FarmLiteDto;
using NucleoLiteDto = ZooSanMarino.Application.DTOs.Shared.NucleoLiteDto;
using GalponLiteDto = ZooSanMarino.Application.DTOs.Shared.GalponLiteDto;

using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services
{
    // Implementa la ILoteService de Application con alias explícito por seguridad
    public class LoteService : AppInterfaces.ILoteService
    {
        private readonly ZooSanMarinoContext _ctx;

        // 👇 Aseguramos que esta es la ICurrentUser “buena”
        private readonly AppInterfaces.ICurrentUser _current;

        public LoteService(ZooSanMarinoContext ctx, AppInterfaces.ICurrentUser current)
        {
            _ctx = ctx;
            _current = current;
        }

        // ===========================
        // LISTADO SIMPLE (compat)
        // ===========================
        public async Task<IEnumerable<LoteDto>> GetAllAsync() =>
            await _ctx.Lotes
                .AsNoTracking()
                .Where(l => l.CompanyId == _current.CompanyId && l.DeletedAt == null)
                .Select(l => new LoteDto(
                    l.LoteId, l.LoteNombre, l.GranjaId, l.NucleoId, l.GalponId,
                    l.Regional, l.FechaEncaset, l.HembrasL, l.MachosL,
                    l.PesoInicialH, l.PesoInicialM, l.UnifH, l.UnifM,
                    l.MortCajaH, l.MortCajaM, l.Raza, l.AnoTablaGenetica,
                    l.Linea, l.TipoLinea, l.CodigoGuiaGenetica,
                    l.Mixtas, l.PesoMixto, l.AvesEncasetadas, l.EdadInicial,
                    l.Tecnico
                ))
                .ToListAsync();

        // ===========================
        // BÚSQUEDA / LISTADO AVANZADO
        // ===========================
        public async Task<CommonDtos.PagedResult<LoteDetailDto>> SearchAsync(LoteSearchRequest req)
        {
            var q = _ctx.Lotes
                .AsNoTracking()
                .Where(l => l.CompanyId == _current.CompanyId);

            if (req.SoloActivos) q = q.Where(l => l.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                var term = req.Search.Trim().ToLower();
                q = q.Where(l =>
                    l.LoteId.ToLower().Contains(term) ||
                    l.LoteNombre.ToLower().Contains(term));
            }

            if (req.GranjaId.HasValue)                    q = q.Where(l => l.GranjaId == req.GranjaId.Value);
            if (!string.IsNullOrWhiteSpace(req.NucleoId)) q = q.Where(l => l.NucleoId == req.NucleoId);
            if (!string.IsNullOrWhiteSpace(req.GalponId)) q = q.Where(l => l.GalponId == req.GalponId);

            if (req.FechaDesde.HasValue) q = q.Where(l => l.FechaEncaset >= req.FechaDesde);
            if (req.FechaHasta.HasValue) q = q.Where(l => l.FechaEncaset <= req.FechaHasta);

            if (!string.IsNullOrWhiteSpace(req.TipoLinea)) q = q.Where(l => l.TipoLinea == req.TipoLinea);
            if (!string.IsNullOrWhiteSpace(req.Raza))      q = q.Where(l => l.Raza == req.Raza);
            if (!string.IsNullOrWhiteSpace(req.Tecnico))   q = q.Where(l => l.Tecnico == req.Tecnico);

            q = ApplyOrder(q, req.SortBy, req.SortDesc);

            var total = await q.LongCountAsync();
            var items = await ProjectToDetail(q)
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .ToListAsync();

            return new CommonDtos.PagedResult<LoteDetailDto>
            {
                Page = req.Page,
                PageSize = req.PageSize,
                Total = total,
                Items = items
            };
        }

        // ===========================
        // GET DETALLE POR ID
        // ===========================
        public async Task<LoteDetailDto?> GetByIdAsync(string loteId)
        {
            var q = _ctx.Lotes
                .AsNoTracking()
                .Where(l => l.CompanyId == _current.CompanyId && l.LoteId == loteId && l.DeletedAt == null);

            return await ProjectToDetail(q).SingleOrDefaultAsync();
        }

        // ===========================
        // CREATE
        // ===========================
        public async Task<LoteDetailDto> CreateAsync(CreateLoteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.LoteId))
                throw new InvalidOperationException("LoteId no puede ser null.");

            await EnsureFarmExists(dto.GranjaId);

            string? nucleoId = dto.NucleoId;
            string? galponId = dto.GalponId;

            if (!string.IsNullOrWhiteSpace(galponId))
            {
                var g = await _ctx.Galpones
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x =>
                        x.GalponId == galponId &&
                        x.CompanyId == _current.CompanyId); // si Galpon no tiene CompanyId, elimina este filtro

                if (g is null) throw new InvalidOperationException("Galpón no existe o no pertenece a la compañía.");
                if (g.GranjaId != dto.GranjaId) throw new InvalidOperationException("Galpón no pertenece a la granja indicada.");
                if (!string.IsNullOrWhiteSpace(dto.NucleoId) &&
                    !string.Equals(g.NucleoId, dto.NucleoId, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Galpón no pertenece al núcleo indicado.");

                nucleoId ??= g.NucleoId; // deriva núcleo si no vino
            }

            if (!string.IsNullOrWhiteSpace(nucleoId))
            {
                var n = await _ctx.Nucleos
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x =>
                        x.NucleoId == nucleoId &&
                        x.GranjaId == dto.GranjaId
                        // && x.CompanyId == _current.CompanyId // ← si Nucleo tiene CompanyId en tu modelo, re-habilita esta línea
                    );

                if (n is null) throw new InvalidOperationException("Núcleo no existe en la granja (o no pertenece a la compañía).");
            }

            var ent = new Lote
            {
                LoteId             = dto.LoteId,
                LoteNombre         = dto.LoteNombre,
                GranjaId           = dto.GranjaId,
                NucleoId           = nucleoId,
                GalponId           = galponId,
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
                Tecnico            = dto.Tecnico,
                Mixtas             = dto.Mixtas,
                PesoMixto          = dto.PesoMixto,
                AvesEncasetadas    = dto.AvesEncasetadas,
                EdadInicial        = dto.EdadInicial,

                CompanyId       = _current.CompanyId,
                CreatedByUserId = _current.UserId,
                CreatedAt       = DateTime.UtcNow
            };

            _ctx.Lotes.Add(ent);
            await _ctx.SaveChangesAsync();

            var result = await GetByIdAsync(ent.LoteId);
            return result ?? throw new InvalidOperationException("No fue posible leer el lote recién creado.");
        }

        // ===========================
        // UPDATE
        // ===========================
        public async Task<LoteDetailDto?> UpdateAsync(UpdateLoteDto dto)
        {
            var ent = await _ctx.Lotes
                .SingleOrDefaultAsync(x => x.LoteId == dto.LoteId &&
                                           x.CompanyId == _current.CompanyId &&
                                           x.DeletedAt == null);
            if (ent is null) return null;

            await EnsureFarmExists(dto.GranjaId);

            if (!string.IsNullOrWhiteSpace(dto.GalponId))
            {
                var g = await _ctx.Galpones.AsNoTracking()
                    .SingleOrDefaultAsync(x => x.GalponId == dto.GalponId &&
                                               x.CompanyId == _current.CompanyId); // quitar si Galpon no tiene CompanyId

                if (g is null) throw new InvalidOperationException("Galpón no existe o no pertenece a la compañía.");
                if (g.GranjaId != dto.GranjaId) throw new InvalidOperationException("Galpón no pertenece a la granja indicada.");
                if (!string.IsNullOrWhiteSpace(dto.NucleoId) &&
                    !string.Equals(g.NucleoId, dto.NucleoId, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Galpón no pertenece al núcleo indicado.");
            }

            if (!string.IsNullOrWhiteSpace(dto.NucleoId))
            {
                var n = await _ctx.Nucleos.AsNoTracking()
                    .SingleOrDefaultAsync(x =>
                        x.NucleoId == dto.NucleoId &&
                        x.GranjaId == dto.GranjaId
                        // && x.CompanyId == _current.CompanyId // re-habilita si existe en el modelo
                    );

                if (n is null) throw new InvalidOperationException("Núcleo no existe en la granja (o no pertenece a la compañía).");
            }

            // Mutación
            ent.LoteNombre         = dto.LoteNombre;
            ent.GranjaId           = dto.GranjaId;
            ent.NucleoId           = dto.NucleoId ?? ent.NucleoId;
            ent.GalponId           = dto.GalponId ?? ent.GalponId;
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
            ent.Mixtas             = dto.Mixtas;
            ent.PesoMixto          = dto.PesoMixto;
            ent.AvesEncasetadas    = dto.AvesEncasetadas;
            ent.EdadInicial        = dto.EdadInicial;

            ent.UpdatedByUserId = _current.UserId;
            ent.UpdatedAt       = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
            return await GetByIdAsync(ent.LoteId);
        }

        // ===========================
        // DELETE (soft) / HARD DELETE
        // ===========================
        public async Task<bool> DeleteAsync(string loteId)
        {
            var ent = await _ctx.Lotes
                .SingleOrDefaultAsync(x => x.LoteId == loteId && x.CompanyId == _current.CompanyId);
            if (ent is null || ent.DeletedAt != null) return false;

            ent.DeletedAt       = DateTime.UtcNow;
            ent.UpdatedByUserId = _current.UserId;
            ent.UpdatedAt       = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HardDeleteAsync(string loteId)
        {
            var ent = await _ctx.Lotes
                .SingleOrDefaultAsync(x => x.LoteId == loteId && x.CompanyId == _current.CompanyId);
            if (ent is null) return false;

            _ctx.Lotes.Remove(ent);
            await _ctx.SaveChangesAsync();
            return true;
        }

        // ===========================
        // Helpers
        // ===========================
        private async Task EnsureFarmExists(int granjaId)
        {
            var exists = await _ctx.Farms
                .AsNoTracking()
                .AnyAsync(f => f.Id == granjaId && f.CompanyId == _current.CompanyId);
            if (!exists) throw new InvalidOperationException("Granja no existe o no pertenece a la compañía.");
        }

        // Proyección -> LoteDetailDto usando Lite DTOs de Shared
        private static IQueryable<LoteDtos.LoteDetailDto> ProjectToDetail(IQueryable<Lote> q)
        {
            return q
                .Include(l => l.Farm)
                .Include(l => l.Nucleo)
                .Include(l => l.Galpon)
                .Select(l => new LoteDtos.LoteDetailDto(
                    l.LoteId,
                    l.LoteNombre,
                    l.GranjaId,
                    l.NucleoId,
                    l.GalponId,
                    l.Regional,
                    l.FechaEncaset,
                    l.HembrasL,
                    l.MachosL,
                    l.PesoInicialH,
                    l.PesoInicialM,
                    l.UnifH,
                    l.UnifM,
                    l.MortCajaH,
                    l.MortCajaM,
                    l.Raza,
                    l.AnoTablaGenetica,
                    l.Linea,
                    l.TipoLinea,
                    l.CodigoGuiaGenetica,
                    l.Tecnico,
                    l.Mixtas,
                    l.PesoMixto,
                    l.AvesEncasetadas,
                    l.EdadInicial,
                    l.CompanyId,
                    l.CreatedByUserId,
                    l.CreatedAt,
                    l.UpdatedByUserId,
                    l.UpdatedAt,
                    new FarmLiteDto(
                        l.Farm.Id,
                        l.Farm.Name,
                        l.Farm.RegionalId,
                        l.Farm.ZoneId
                    ),
                    l.Nucleo == null
                        ? null
                        : new NucleoLiteDto(
                            l.Nucleo.NucleoId,
                            l.Nucleo.NucleoNombre,
                            l.Nucleo.GranjaId
                        ),
                    l.Galpon == null
                        ? null
                        : new GalponLiteDto(
                            l.Galpon.GalponId,
                            l.Galpon.GalponNombre,
                            l.Galpon.NucleoId,
                            l.Galpon.GranjaId
                        )
                ));
        }

        private static IQueryable<Lote> ApplyOrder(IQueryable<Lote> q, string sortBy, bool desc)
        {
            Expression<Func<Lote, object>> key = (sortBy ?? "").ToLower() switch
            {
                "lote_nombre"   => l => l.LoteNombre,
                "lote_id"       => l => l.LoteId,
                "fecha_encaset" => l => l.FechaEncaset ?? DateTime.MinValue,
                _               => l => l.FechaEncaset ?? DateTime.MinValue
            };
            return desc ? q.OrderByDescending(key) : q.OrderBy(key);
        }
    }
}
