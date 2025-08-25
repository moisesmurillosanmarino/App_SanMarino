using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IMenuService
{
    // Árbol completo (admin/tools)
    Task<IEnumerable<MenuItemDto>> GetTreeAsync();

    // Árbol filtrado por permisos del usuario
    Task<IEnumerable<MenuItemDto>> GetForUserAsync(Guid userId);
    
    // ABM
    Task<MenuItemDto> CreateAsync(CreateMenuDto dto);
    Task<MenuItemDto?> UpdateAsync(UpdateMenuDto dto);
    Task<bool> DeleteAsync(int id);
}
