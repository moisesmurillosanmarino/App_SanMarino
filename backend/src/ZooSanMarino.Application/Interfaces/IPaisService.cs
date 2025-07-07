// src/ZooSanMarino.Application/Interfaces/IPaisService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IPaisService
{
    Task<IEnumerable<PaisDto>> GetAllAsync();
    Task<PaisDto?>             GetByIdAsync(int id);
    Task<PaisDto>              CreateAsync(CreatePaisDto dto);
    Task<PaisDto?>             UpdateAsync(UpdatePaisDto dto);
    Task<bool>                 DeleteAsync(int id);
}
