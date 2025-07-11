// src/ZooSanMarino.Application/Interfaces/IUserService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(Guid id);
}
