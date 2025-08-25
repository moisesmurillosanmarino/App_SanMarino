// src/ZooSanMarino.Infrastructure/Services/UserService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ZooSanMarinoContext _ctx;
    private readonly IPasswordHasher<Login> _hasher;

    public UserService(ZooSanMarinoContext ctx, IPasswordHasher<Login> hasher)
    {
        _ctx = ctx;
        _hasher = hasher;
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            Id         = Guid.NewGuid(),
            surName    = dto.SurName,
            firstName  = dto.FirstName,
            cedula     = dto.Cedula,
            telefono   = dto.Telefono,
            ubicacion  = dto.Ubicacion,
            IsActive   = true,
            CreatedAt  = DateTime.UtcNow
        };
        _ctx.Users.Add(user);

        var login = new Login
        {
            Id           = Guid.NewGuid(),
            email        = dto.Email,
            PasswordHash = _hasher.HashPassword(null!, dto.Password),
            IsEmailLogin = true,
            IsDeleted    = false
        };
        _ctx.Logins.Add(login);

        _ctx.UserLogins.Add(new UserLogin { UserId = user.Id, LoginId = login.Id });

        _ctx.UserCompanies.AddRange(
            dto.CompanyIds.Select(cid => new UserCompany { UserId = user.Id, CompanyId = cid })
        );

        _ctx.UserRoles.AddRange(
            dto.RoleIds.Select(rid => new UserRole { UserId = user.Id, RoleId = rid })
        );

        await _ctx.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.surName,
            user.firstName,
            user.cedula,
            user.telefono,
            user.ubicacion,
            await _ctx.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.Role.Name).ToArrayAsync(),
            dto.CompanyIds,
            user.IsActive,
            user.IsLocked,
            user.CreatedAt,
            user.LastLoginAt
        );
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        return await _ctx.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.UserCompanies)
            .Select(u => new UserDto(
                u.Id,
                u.surName,
                u.firstName,
                u.cedula,
                u.telefono,
                u.ubicacion,
                u.UserRoles.Select(ur => ur.Role.Name).ToArray(),
                u.UserCompanies.Select(uc => uc.CompanyId).ToArray(),
                u.IsActive,
                u.IsLocked,
                u.CreatedAt,
                u.LastLoginAt
            ))
            .ToListAsync();
    }

    // src/ZooSanMarino.Infrastructure/Services/UserService.cs
    public async Task<List<UserListDto>> GetUsersAsync()
    {
        return await _ctx.Users
            .Include(u => u.UserLogins).ThenInclude(ul => ul.Login)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.UserCompanies).ThenInclude(uc => uc.Company)
            .Select(u => new UserListDto
            {
                Id        = u.Id,
                FirstName = u.firstName,
                SurName   = u.surName,
                Email     = u.UserLogins.Select(x => x.Login.email).FirstOrDefault() ?? string.Empty,
                IsActive  = u.IsActive,
                Cedula    = u.cedula,
                Telefono  = u.telefono,
                Ubicacion = u.ubicacion,

                Roles          = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                CompanyNames   = u.UserCompanies.Select(uc => uc.Company.Name).ToList(),

                // “Principales” por conveniencia (primera coincidencia)
                PrimaryRole    = u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault(),
                PrimaryCompany = u.UserCompanies.Select(uc => uc.Company.Name).FirstOrDefault()
            })
            .ToListAsync();
    }


    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _ctx.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.UserCompanies)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return new UserDto(
            user.Id,
            user.surName,
            user.firstName,
            user.cedula,
            user.telefono,
            user.ubicacion,
            user.UserRoles.Select(ur => ur.Role.Name).ToArray(),
            user.UserCompanies.Select(uc => uc.CompanyId).ToArray(),
            user.IsActive,
            user.IsLocked,
            user.CreatedAt,
            user.LastLoginAt
        );
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _ctx.Users
            .Include(u => u.UserCompanies)
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado");

        // Campos simples (parciales)
        if (dto.SurName   is not null) user.surName   = dto.SurName.Trim();
        if (dto.FirstName is not null) user.firstName = dto.FirstName.Trim();
        if (dto.Cedula    is not null) user.cedula    = dto.Cedula.Trim();
        if (dto.Telefono  is not null) user.telefono  = dto.Telefono.Trim();
        if (dto.Ubicacion is not null) user.ubicacion = dto.Ubicacion.Trim();
        if (dto.IsActive  is not null) user.IsActive  = dto.IsActive.Value;
        if (dto.IsLocked  is not null) user.IsLocked  = dto.IsLocked.Value;

        // Compañías (si vienen)
        if (dto.CompanyIds is not null)
        {
            _ctx.UserCompanies.RemoveRange(user.UserCompanies);
            _ctx.UserCompanies.AddRange(dto.CompanyIds.Distinct().Select(cid => new UserCompany
            {
                UserId = user.Id, CompanyId = cid
            }));
        }

        // Roles (si vienen)
        if (dto.RoleIds is not null)
        {
            _ctx.UserRoles.RemoveRange(user.UserRoles);
            _ctx.UserRoles.AddRange(dto.RoleIds.Distinct().Select(rid => new UserRole
            {
                UserId = user.Id, RoleId = rid
            }));
        }

        await _ctx.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.surName,
            user.firstName,
            user.cedula,
            user.telefono,
            user.ubicacion,
            await _ctx.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.Role.Name).ToArrayAsync(),
            await _ctx.UserCompanies.Where(uc => uc.UserId == user.Id).Select(uc => uc.CompanyId).ToArrayAsync(),
            user.IsActive,
            user.IsLocked,
            user.CreatedAt,
            user.LastLoginAt
        );
    }

    public async Task DeleteAsync(Guid id)
    {
        await using var tx = await _ctx.Database.BeginTransactionAsync();

        var user = await _ctx.Users
            .Include(u => u.UserLogins).ThenInclude(ul => ul.Login)
            .Include(u => u.UserCompanies)
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado");

        // 1) Relaciones dependientes explícitas
        var logins = user.UserLogins.Select(ul => ul.Login).ToList();

        _ctx.UserLogins.RemoveRange(user.UserLogins);
        _ctx.UserRoles.RemoveRange(user.UserRoles);
        _ctx.UserCompanies.RemoveRange(user.UserCompanies);
        _ctx.Logins.RemoveRange(logins);

        // 2) Entidad raíz
        _ctx.Users.Remove(user);

        await _ctx.SaveChangesAsync();
        await tx.CommitAsync();
    }
}
