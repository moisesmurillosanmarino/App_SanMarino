// src/ZooSanMarino.Application/Interfaces/ILoteService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ILoteService
{
    Task<IEnumerable<LoteDto>> GetAllAsync();
    Task<LoteDto?>            GetByIdAsync(string loteId);
    Task<LoteDto>             CreateAsync(CreateLoteDto dto);
    Task<LoteDto?>            UpdateAsync(UpdateLoteDto dto);
    Task<bool>                DeleteAsync(string loteId);
}
