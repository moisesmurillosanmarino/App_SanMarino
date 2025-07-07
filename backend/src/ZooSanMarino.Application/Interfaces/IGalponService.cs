// src/ZooSanMarino.Application/Interfaces/IGalponService.cs
using ZooSanMarino.Application.DTOs;
namespace ZooSanMarino.Application.Interfaces;

public interface IGalponService
{
    Task<IEnumerable<GalponDto>> GetAllAsync();
    Task<GalponDto?> GetByIdAsync(string galponId);
    Task<GalponDto> CreateAsync(CreateGalponDto dto);
    Task<GalponDto?> UpdateAsync(UpdateGalponDto dto);
    Task<bool> DeleteAsync(string galponId);
      // ← Nuevo método:
    Task<IEnumerable<GalponDto>> GetByGranjaAndNucleoAsync(int granjaId, string nucleoId);
}
