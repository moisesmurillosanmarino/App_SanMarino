// src/ZooSanMarino.Application/Interfaces/ILoteReproductoraService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ILoteReproductoraService
{
    Task<IEnumerable<LoteReproductoraDto>> GetAllAsync();
    Task<LoteReproductoraDto?>             GetByIdAsync(string loteId, string repId);
    Task<LoteReproductoraDto>              CreateAsync(CreateLoteReproductoraDto dto);
    Task<LoteReproductoraDto?>             UpdateAsync(UpdateLoteReproductoraDto dto);
    Task<bool>                             DeleteAsync(string loteId, string repId);
}
