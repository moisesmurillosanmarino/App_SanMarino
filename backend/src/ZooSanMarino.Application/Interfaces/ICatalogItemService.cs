using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface ICatalogItemService
{
    // Listado (con total)
    Task<PagedResult<CatalogItemDto>> GetAsync(string? q, int page, int pageSize, CancellationToken ct = default);

    // Leer
    Task<CatalogItemDto?> GetByIdAsync(int id, CancellationToken ct = default);

    // Crear
    Task<CatalogItemDto?> CreateAsync(CatalogItemCreateRequest dto, CancellationToken ct = default);

    // Actualizar
    Task<CatalogItemDto?> UpdateAsync(int id, CatalogItemUpdateRequest dto, CancellationToken ct = default);

    // Eliminar (lógico por defecto; hard=true borra físico)
    Task<bool> DeleteAsync(int id, bool hard = false, CancellationToken ct = default);

    // Ya existente
    Task<int> UpsertBulkAsync(IEnumerable<CatalogItemDto> items, CancellationToken ct = default);
}
