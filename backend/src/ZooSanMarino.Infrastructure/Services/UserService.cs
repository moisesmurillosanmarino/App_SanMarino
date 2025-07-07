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
    private readonly ZooSanMarinoContext     _ctx;
    private readonly IPasswordHasher<Login>  _hasher;

    public UserService(ZooSanMarinoContext ctx, IPasswordHasher<Login> hasher)
    {
        _ctx    = ctx;
        _hasher = hasher;
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User {
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

        var login = new Login {
            Id           = Guid.NewGuid(),
            email        = dto.Email,
            PasswordHash = _hasher.HashPassword(null!, dto.Password),
            IsEmailLogin = true,
            IsDeleted    = false
        };
        _ctx.Logins.Add(login);

        _ctx.UserLogins.Add(new UserLogin {
            UserId  = user.Id,
            LoginId = login.Id
        });

        _ctx.UserCompanies.AddRange(
            dto.CompanyIds.Select(cid => new UserCompany {
                UserId    = user.Id,
                CompanyId = cid
            })
        );

        _ctx.UserRoles.AddRange(
            dto.RoleIds.Select(rid => new UserRole {
                UserId = user.Id,
                RoleId = rid
            })
        );

        await _ctx.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.surName,
            user.firstName,
            user.cedula,
            user.telefono,
            user.ubicacion,
            await _ctx.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Select(ur => ur.Role.Name)
                .ToArrayAsync(),
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
            )).ToListAsync();
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
}
