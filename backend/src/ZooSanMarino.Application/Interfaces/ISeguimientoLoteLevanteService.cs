// file: backend/src/ZooSanMarino.Application/Interfaces/ISeguimientoLoteLevanteService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ISeguimientoLoteLevanteService
{
    Task<IEnumerable<SeguimientoLoteLevanteDto>> GetByLoteAsync(string loteId);
    Task<IEnumerable<SeguimientoLoteLevanteDto>> FilterAsync(string? loteId, DateTime? desde, DateTime? hasta);
    Task<SeguimientoLoteLevanteDto>  CreateAsync(SeguimientoLoteLevanteDto dto);
    Task<SeguimientoLoteLevanteDto?> UpdateAsync(SeguimientoLoteLevanteDto dto);
    Task<bool> DeleteAsync(int id);
}
