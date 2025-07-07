using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ZooSanMarinoContext _ctx;
    private readonly IPasswordHasher<Login> _hasher;
    private readonly IConfiguration _cfg;

    public AuthService(ZooSanMarinoContext ctx, IPasswordHasher<Login> hasher, IConfiguration cfg)
    {
        _ctx = ctx;
        _hasher = hasher;
        _cfg = cfg;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _ctx.Logins.AnyAsync(l => l.email == dto.Email))
            throw new InvalidOperationException("El correo ya está registrado");

        var login = new Login
        {
            Id           = Guid.NewGuid(),
            email        = dto.Email,
            PasswordHash = _hasher.HashPassword(null!, dto.Password),
            IsEmailLogin = true,
            IsDeleted    = false
        };

        var user = new User
        {
            Id        = Guid.NewGuid(),
            surName   = dto.SurName,
            firstName = dto.FirstName,
            cedula    = dto.Cedula,
            telefono  = dto.Telefono,
            ubicacion = dto.Ubicacion,
            IsActive  = true,
            CreatedAt = DateTime.UtcNow
        };

        _ctx.Users.Add(user);
        _ctx.Logins.Add(login);
        _ctx.UserLogins.Add(new UserLogin { UserId = user.Id, LoginId = login.Id });

        foreach (var companyId in dto.CompanyIds)
            _ctx.UserCompanies.Add(new UserCompany { UserId = user.Id, CompanyId = companyId });

        if (dto.RoleIds is not null)
        {
            foreach (var companyId in dto.CompanyIds)
            {
                foreach (var roleId in dto.RoleIds)
                {
                    _ctx.UserRoles.Add(new UserRole
                    {
                        UserId    = user.Id,
                        RoleId    = roleId,
                        CompanyId = companyId
                    });
                }
            }
        }


        await _ctx.SaveChangesAsync();

        return await GenerateResponseAsync(user, login);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var login = await _ctx.Logins
            .Include(l => l.UserLogins)
                .ThenInclude(ul => ul.User)
            .FirstOrDefaultAsync(l => l.email == dto.Email && !l.IsDeleted);

        if (login == null)
            throw new InvalidOperationException("Credenciales inválidas");

        var userLogin = login.UserLogins.FirstOrDefault();
        if (userLogin == null)
            throw new InvalidOperationException("Usuario no relacionado");

        var user = userLogin.User;

        if (!user.IsActive || user.IsLocked || userLogin.IsLockedByAdmin)
            throw new InvalidOperationException("El usuario está bloqueado");

        var result = _hasher.VerifyHashedPassword(login, login.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            user.FailedAttempts++;
            if (user.FailedAttempts >= 5)
            {
                user.IsLocked = true;
                user.LockedAt = DateTime.UtcNow;
            }

            await _ctx.SaveChangesAsync();
            throw new InvalidOperationException("Credenciales inválidas");
        }

        user.FailedAttempts = 0;
        user.LastLoginAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();

        return await GenerateResponseAsync(user, login);
    }

    private async Task<AuthResponseDto> GenerateResponseAsync(User user, Login login)
    {
        var userCompanies = await _ctx.UserCompanies
            .Include(uc => uc.Company)
            .Where(uc => uc.UserId == user.Id)
            .ToListAsync();

        var userRoles = await _ctx.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.UserId == user.Id)
            .ToListAsync();

        var roleIds = userRoles.Select(r => r.RoleId).ToList();

        var permissions = await _ctx.RolePermissions
            .Include(rp => rp.Permission)
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Key)
            .Distinct()
            .ToListAsync();

        var jwt = _cfg.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, login.email),
            new Claim("surName", user.surName),
            new Claim("firstName", user.firstName)
        };

        claims.AddRange(userRoles.Select(r => new Claim("role", r.Role.Name)));
        claims.AddRange(userCompanies.Select(c => new Claim("company", c.Company.Name)));
        claims.AddRange(permissions.Select(p => new Claim("perm", p)));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["DurationInMinutes"]!)),
            signingCredentials: creds
        );

        return new AuthResponseDto
        {
            Username  = login.email,
            FullName  = $"{user.firstName} {user.surName}",
            UserId    = user.Id,
            Token     = new JwtSecurityTokenHandler().WriteToken(token),
            Roles     = userRoles.Select(r => r.Role.Name).ToList(),
            Empresas  = userCompanies.Select(c => c.Company.Name).ToList(),
            Permisos  = permissions
        };
    }
}
