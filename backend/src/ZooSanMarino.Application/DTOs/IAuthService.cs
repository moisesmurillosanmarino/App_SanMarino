// ZooSanMarino.Application/Interfaces/IAuthService.cs
namespace ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Application.DTOs;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync   (LoginDto    dto);
}