using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ILoteReproductoraService
{
    Task<IEnumerable<LoteReproductoraDto>> GetAllAsync(string? loteId = null);
    Task<LoteReproductoraDto?>             GetByIdAsync(string loteId, string repId);
    Task<LoteReproductoraDto>              CreateAsync(CreateLoteReproductoraDto dto);
    Task<IEnumerable<LoteReproductoraDto>> CreateBulkAsync(IEnumerable<CreateLoteReproductoraDto> dtos); // 👈 nuevo
    Task<LoteReproductoraDto?>             UpdateAsync(UpdateLoteReproductoraDto dto);
    Task<bool>                             DeleteAsync(string loteId, string repId);
}
