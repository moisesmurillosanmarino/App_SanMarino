// file: src/ZooSanMarino.Application/Interfaces/IFarmService.cs
using ZooSanMarino.Application.DTOs;               // FarmDto, Create/Update
using FarmDtos  = ZooSanMarino.Application.DTOs.Farms;   // FarmDetailDto, FarmSearchRequest, FarmTreeDto
using CommonDtos = ZooSanMarino.Application.DTOs.Common; // ⟵ alias para PagedResult<>

namespace ZooSanMarino.Application.Interfaces;

public interface IFarmService
{
    Task<IEnumerable<FarmDto>> GetAllAsync();
    Task<FarmDto?>             GetByIdAsync(int id);
    Task<FarmDto>              CreateAsync(CreateFarmDto dto);
    Task<FarmDto?>             UpdateAsync(UpdateFarmDto dto);
    Task<bool>                 DeleteAsync(int id);

    Task<CommonDtos.PagedResult<FarmDtos.FarmDetailDto>> SearchAsync(FarmDtos.FarmSearchRequest req);
    Task<FarmDtos.FarmDetailDto?>                        GetDetailByIdAsync(int id);
    Task<FarmDtos.FarmTreeDto?>                          GetTreeByIdAsync(int farmId, bool soloActivos = true);
    Task<bool>                                           HardDeleteAsync(int id);
}
