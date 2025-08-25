// src/ZooSanMarino.Application/Interfaces/IAuthService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);

    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task ChangeEmailAsync(Guid userId, ChangeEmailDto dto);
}
