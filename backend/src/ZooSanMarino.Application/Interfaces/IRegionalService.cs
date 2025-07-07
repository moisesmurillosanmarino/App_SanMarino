// src/ZooSanMarino.Application/Interfaces/IRegionalService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IRegionalService
{
    Task<IEnumerable<RegionalDto>> GetAllAsync();
    Task<RegionalDto?>             GetByIdAsync(int cia, int id);
    Task<RegionalDto>              CreateAsync(CreateRegionalDto dto);
    Task<RegionalDto?>             UpdateAsync(UpdateRegionalDto dto);
    Task<bool>                     DeleteAsync(int cia, int id);
}
