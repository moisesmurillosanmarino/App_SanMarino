// src/ZooSanMarino.Infrastructure/Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.Options;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ZooSanMarinoContext _ctx;
    private readonly IPasswordHasher<Login> _hasher;
    private readonly JwtOptions _jwt;

    public AuthService(ZooSanMarinoContext ctx, IPasswordHasher<Login> hasher, JwtOptions jwt)
    {
        _ctx = ctx;
        _hasher = hasher;
        _jwt = jwt;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Registro
    // ─────────────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // email único
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

        var userLogin = new UserLogin { UserId = user.Id, LoginId = login.Id };

        _ctx.Users.Add(user);
        _ctx.Logins.Add(login);
        _ctx.UserLogins.Add(userLogin);

        foreach (var companyId in dto.CompanyIds.Distinct())
            _ctx.UserCompanies.Add(new UserCompany { UserId = user.Id, CompanyId = companyId });

        if (dto.RoleIds is not null && dto.RoleIds.Length > 0)
        {
            foreach (var companyId in dto.CompanyIds.Distinct())
            foreach (var roleId in dto.RoleIds.Distinct())
            {
                _ctx.UserRoles.Add(new UserRole
                {
                    UserId    = user.Id,
                    RoleId    = roleId,
                    CompanyId = companyId
                });
            }
        }

        await _ctx.SaveChangesAsync();

        return await GenerateResponseAsync(user, login);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var login = await _ctx.Logins
            .Include(l => l.UserLogins)
                .ThenInclude(ul => ul.User)
            .FirstOrDefaultAsync(l => l.email == dto.Email && !l.IsDeleted);

        if (login is null)
            throw new InvalidOperationException("Credenciales inválidas");

        var userLogin = login.UserLogins.FirstOrDefault();
        if (userLogin is null)
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

    // ─────────────────────────────────────────────────────────────────────
    // Cambiar contraseña
    // ─────────────────────────────────────────────────────────────────────
    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var login = await _ctx.UserLogins
            .Include(ul => ul.Login)
            .Where(ul => ul.UserId == userId)
            .Select(ul => ul.Login)
            .FirstOrDefaultAsync();

        if (login is null)
            throw new InvalidOperationException("Login no encontrado");

        var check = _hasher.VerifyHashedPassword(login, login.PasswordHash, dto.CurrentPassword);
        if (check == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Contraseña actual inválida");

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            throw new InvalidOperationException("La nueva contraseña debe tener al menos 6 caracteres");

        login.PasswordHash = _hasher.HashPassword(login, dto.NewPassword);
        await _ctx.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Cambiar email (requiere contraseña actual)
    // ─────────────────────────────────────────────────────────────────────
    public async Task ChangeEmailAsync(Guid userId, ChangeEmailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewEmail))
            throw new InvalidOperationException("El correo nuevo es obligatorio");

        // nuevo único
        if (await _ctx.Logins.AnyAsync(l => l.email == dto.NewEmail))
            throw new InvalidOperationException("El correo nuevo ya está en uso");

        var login = await _ctx.UserLogins
            .Include(ul => ul.Login)
            .Where(ul => ul.UserId == userId)
            .Select(ul => ul.Login)
            .FirstOrDefaultAsync();

        if (login is null)
            throw new InvalidOperationException("Login no encontrado");

        var check = _hasher.VerifyHashedPassword(login, login.PasswordHash, dto.CurrentPassword);
        if (check == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Contraseña actual inválida");

        login.email = dto.NewEmail.Trim();
        await _ctx.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────
    private async Task<AuthResponseDto> GenerateResponseAsync(User user, Login login)
    {
        // compañías
        var userCompanies = await _ctx.UserCompanies
            .Include(uc => uc.Company)
            .Where(uc => uc.UserId == user.Id)
            .ToListAsync();

        // roles
        var userRoles = await _ctx.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.UserId == user.Id)
            .ToListAsync();

        var roleIds = userRoles
            .Select(r => r.RoleId)
            .Distinct()
            .ToList();

        // permisos desde roles
        var permissions = await _ctx.RolePermissions
            .Include(rp => rp.Permission)
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Key)
            .Distinct()
            .ToListAsync();

        // claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),

            new Claim(JwtRegisteredClaimNames.UniqueName, login.email),
            new Claim(JwtRegisteredClaimNames.Email,      login.email),

            new Claim("firstName", user.firstName ?? string.Empty),
            new Claim("surName",   user.surName   ?? string.Empty),
        };

        // roles
        foreach (var roleName in userRoles.Select(r => r.Role?.Name)
                                          .Where(n => !string.IsNullOrWhiteSpace(n))
                                          .Distinct())
            claims.Add(new Claim(ClaimTypes.Role, roleName!));

        // empresas
        foreach (var c in userCompanies)
        {
            claims.Add(new Claim("company_id", c.CompanyId.ToString()));
            var name = c.Company?.Name;
            if (!string.IsNullOrWhiteSpace(name))
                claims.Add(new Claim("company", name!));
        }

        // permisos (los que usan tus policies)
        foreach (var p in permissions.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct())
            claims.Add(new Claim("permission", p));

        // token
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_jwt.DurationInMinutes > 0 ? _jwt.DurationInMinutes : 120);

        var token = new JwtSecurityToken(
            issuer:            _jwt.Issuer,
            audience:          _jwt.Audience,
            claims:            claims,
            expires:           expires,
            signingCredentials: creds
        );

        return new AuthResponseDto
        {
            Username = login.email,
            FullName = $"{user.firstName} {user.surName}".Trim(),
            UserId   = user.Id,
            Token    = new JwtSecurityTokenHandler().WriteToken(token),
            Roles    = userRoles.Select(r => r.Role?.Name).Where(n => !string.IsNullOrWhiteSpace(n)).Distinct().ToList()!,
            Empresas = userCompanies.Select(c => c.Company?.Name).Where(n => !string.IsNullOrWhiteSpace(n)).Distinct().ToList()!,
            Permisos = permissions
        };
    }
}
