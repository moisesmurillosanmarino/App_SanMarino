// src/ZooSanMarino.Application/Interfaces/IFarmService.cs
using ZooSanMarino.Application.DTOs;
namespace ZooSanMarino.Application.Interfaces;
public interface IFarmService
{
    Task<IEnumerable<FarmDto>> GetAllAsync();
    Task<FarmDto?>             GetByIdAsync(int id);
    Task<FarmDto>              CreateAsync(CreateFarmDto dto);
    Task<FarmDto?>             UpdateAsync(UpdateFarmDto dto);
    Task<bool>                 DeleteAsync(int id);
}
