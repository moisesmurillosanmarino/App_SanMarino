// ZooSanMarino.Application/Interfaces/IDepartamentoService.cs
using ZooSanMarino.Application.DTOs;

public interface IDepartamentoService
{
    Task<IEnumerable<DepartamentoDto>> GetAllAsync();
    Task<DepartamentoDto?>           GetByIdAsync(int id);
    Task<DepartamentoDto>            CreateAsync(CreateDepartamentoDto dto);
    Task<bool>                       UpdateAsync(UpdateDepartamentoDto dto);
    Task<bool>                       DeleteAsync(int id);
}
