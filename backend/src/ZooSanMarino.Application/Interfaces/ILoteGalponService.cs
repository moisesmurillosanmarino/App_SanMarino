// src/ZooSanMarino.Application/Interfaces/ILoteGalponService.cs
using ZooSanMarino.Application.DTOs;
namespace ZooSanMarino.Application.Interfaces;
public interface ILoteGalponService
{
    Task<IEnumerable<LoteGalponDto>> GetAllAsync();
    Task<LoteGalponDto?>            GetByIdAsync(string loteId, string repId, string galponId);
    Task<LoteGalponDto>             CreateAsync(CreateLoteGalponDto dto);
    Task<LoteGalponDto?>            UpdateAsync(UpdateLoteGalponDto dto);
    Task<bool>                      DeleteAsync(string loteId, string repId, string galponId);
}
