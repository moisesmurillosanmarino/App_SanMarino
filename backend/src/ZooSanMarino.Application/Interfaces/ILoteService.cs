// src/ZooSanMarino.Application/Interfaces/ILoteService.cs
using ZooSanMarino.Application.DTOs;          // LoteDto, Create/Update DTOs
using ZooSanMarino.Application.DTOs.Lotes;    // LoteDetailDto, LoteSearchRequest
// 👇 alias al namespace "Common"
using CommonDtos = ZooSanMarino.Application.DTOs.Common;

namespace ZooSanMarino.Application.Interfaces;

public interface ILoteService
{
    // Compat existentes
    Task<IEnumerable<LoteDto>> GetAllAsync();
    Task<bool>                 DeleteAsync(string loteId);

    // Nuevos / detallados
    Task<CommonDtos.PagedResult<LoteDetailDto>> SearchAsync(LoteSearchRequest req);
    Task<LoteDetailDto?>                        GetByIdAsync(string loteId);
    Task<LoteDetailDto>                         CreateAsync(CreateLoteDto dto);
    Task<LoteDetailDto?>                        UpdateAsync(UpdateLoteDto dto);

    // Limpieza dura (opcional)
    Task<bool> HardDeleteAsync(string loteId);
}
