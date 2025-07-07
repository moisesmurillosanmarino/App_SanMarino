using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ISeguimientoLoteLevanteService
{
    Task<IEnumerable<SeguimientoLoteLevanteDto>> GetByLoteAsync(string loteId);
    Task<SeguimientoLoteLevanteDto> CreateAsync(SeguimientoLoteLevanteDto dto);
    Task<SeguimientoLoteLevanteDto?> UpdateAsync(SeguimientoLoteLevanteDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<SeguimientoLoteLevanteDto>> FilterAsync(string? loteId, DateTime? desde, DateTime? hasta);

}
