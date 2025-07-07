using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly ZooSanMarinoContext _ctx;
    public RoleService(ZooSanMarinoContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<RoleDto>> GetAllAsync() =>
        await _ctx.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.RoleCompanies)
            .Select(r => new RoleDto(
                r.Id,
                r.Name,
                r.RolePermissions.Select(rp => rp.Permission.Key).ToArray(),
                r.RoleCompanies.Select(rc => rc.CompanyId).ToArray()
            ))
            .ToListAsync();

    public async Task<RoleDto?> GetByIdAsync(int id) =>
        await _ctx.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.RoleCompanies)
            .Where(r => r.Id == id)
            .Select(r => new RoleDto(
                r.Id,
                r.Name,
                r.RolePermissions.Select(rp => rp.Permission.Key).ToArray(),
                r.RoleCompanies.Select(rc => rc.CompanyId).ToArray()
            ))
            .SingleOrDefaultAsync();

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        var role = new Role {
            Name = dto.Name
        };
        _ctx.Roles.Add(role);
        await _ctx.SaveChangesAsync();

        // Asignar permisos
        var rolePerms = dto.Permissions.Select(p => new RolePermission {
            RoleId = role.Id,
            PermissionId = _ctx.Permissions.First(x => x.Key == p).Id
        });
        _ctx.RolePermissions.AddRange(rolePerms);

        // Asociar empresas (si existen)
        var roleCompanies = dto.CompanyIds.Select(cid => new RoleCompany {
            RoleId = role.Id,
            CompanyId = cid
        });
        _ctx.RoleCompanies.AddRange(roleCompanies);

        await _ctx.SaveChangesAsync();

        var result = await GetByIdAsync(role.Id);
        if (result is null) throw new InvalidOperationException("Role not found after creation.");
        return result;
    }

    public async Task<RoleDto?> UpdateAsync(UpdateRoleDto dto)
    {
        var role = await _ctx.Roles
            .Include(r => r.RolePermissions)
            .Include(r => r.RoleCompanies)
            .SingleOrDefaultAsync(r => r.Id == dto.Id);

        if (role is null) return null;

        role.Name = dto.Name;

        // Reemplazar permisos
        _ctx.RolePermissions.RemoveRange(role.RolePermissions);
        var newPermissions = dto.Permissions.Select(p => new RolePermission {
            RoleId = role.Id,
            PermissionId = _ctx.Permissions.First(x => x.Key == p).Id
        });
        _ctx.RolePermissions.AddRange(newPermissions);

        // Reemplazar asociaciones con empresas
        _ctx.RoleCompanies.RemoveRange(role.RoleCompanies);
        var newCompanies = dto.CompanyIds.Select(cid => new RoleCompany {
            RoleId = role.Id,
            CompanyId = cid
        });
        _ctx.RoleCompanies.AddRange(newCompanies);

        await _ctx.SaveChangesAsync();
        return await GetByIdAsync(role.Id)!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var role = await _ctx.Roles.FindAsync(id);
        if (role is null) return false;

        _ctx.Roles.Remove(role);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
