// src/ZooSanMarino.Application/Interfaces/INucleoService.cs
using ZooSanMarino.Application.DTOs;
namespace ZooSanMarino.Application.Interfaces;
public interface INucleoService
{
    Task<IEnumerable<NucleoDto>> GetAllAsync();
    Task<NucleoDto?>             GetByIdAsync(string nucleoId, int granjaId);
    Task<NucleoDto>              CreateAsync(CreateNucleoDto dto);
    Task<NucleoDto?>             UpdateAsync(UpdateNucleoDto dto);
    Task<bool>                   DeleteAsync(string nucleoId, int granjaId);
}
