// Interfaces/IZonaService.cs
using ZooSanMarino.Application.DTOs;
namespace ZooSanMarino.Application.Interfaces;
public interface IZonaService
{
    Task<IEnumerable<ZonaDto>> GetAllAsync();
    Task<ZonaDto?>            GetByIdAsync(int cia, int id);
    Task<ZonaDto>             CreateAsync(CreateZonaDto dto);
    Task<ZonaDto?>            UpdateAsync(UpdateZonaDto dto);
    Task<bool>                DeleteAsync(int cia, int id);
}