// ZooSanMarino.Application/Interfaces/IMunicipioService.cs
using ZooSanMarino.Application.DTOs;

public interface IMunicipioService
{
    Task<IEnumerable<MunicipioDto>> GetAllAsync();
    Task<MunicipioDto?>           GetByIdAsync(int id);
    Task<MunicipioDto>            CreateAsync(CreateMunicipioDto dto);
    Task<bool>                    UpdateAsync(UpdateMunicipioDto dto);
    Task<bool>                    DeleteAsync(int id);
}
