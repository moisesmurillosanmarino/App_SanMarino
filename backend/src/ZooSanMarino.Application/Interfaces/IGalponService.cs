// file: src/ZooSanMarino.Application/Interfaces/IGalponService.cs

using ZooSanMarino.Application.DTOs;
using CommonDtos = ZooSanMarino.Application.DTOs.Common;
using ZooSanMarino.Application.DTOs.Galpones;

namespace ZooSanMarino.Application.Interfaces;

public interface IGalponService
{
    // -------------------------
    // CRUD básicos (retrocompatibilidad)
    // -------------------------
    Task<IEnumerable<GalponDto>> GetAllAsync();
    Task<GalponDto?>             GetByIdAsync(string galponId);
    Task<IEnumerable<GalponDto>> GetByGranjaAndNucleoAsync(int granjaId, string nucleoId);
    Task<GalponDto>              CreateAsync(CreateGalponDto dto);
    Task<GalponDto?>             UpdateAsync(UpdateGalponDto dto);
    Task<bool>                   DeleteAsync(string galponId);
    Task<bool>                   HardDeleteAsync(string galponId);

    // -------------------------
    // Nuevos métodos detallados (GalponDetailDto)
    // -------------------------
    Task<CommonDtos.PagedResult<GalponDetailDto>> SearchAsync(GalponSearchRequest req);
    Task<GalponDetailDto?>                        GetDetailByIdAsync(string galponId);
    Task<IEnumerable<GalponDetailDto>>            GetAllDetailAsync();
    Task<GalponDetailDto?>                        GetDetailByIdSimpleAsync(string galponId);
    Task<IEnumerable<GalponDetailDto>>            GetDetailByGranjaAndNucleoAsync(int granjaId, string nucleoId);
}
