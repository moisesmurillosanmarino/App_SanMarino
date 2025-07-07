// src/ZooSanMarino.Application/Interfaces/ILoteSeguimientoService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ILoteSeguimientoService
{
    Task<IEnumerable<LoteSeguimientoDto>> GetAllAsync();
    Task<LoteSeguimientoDto?>             GetByIdAsync(int id);
    Task<LoteSeguimientoDto>              CreateAsync(CreateLoteSeguimientoDto dto);
    Task<LoteSeguimientoDto?>             UpdateAsync(UpdateLoteSeguimientoDto dto);
    Task<bool>                           DeleteAsync(int id);
}
