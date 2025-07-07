// src/ZooSanMarino.Application/DTOs/RoleDto.cs
namespace ZooSanMarino.Application.DTOs;

public record RoleDto(
    int      Id,
    string   Name,
    string[] Permissions,
    int[]    CompanyIds
);

public record CreateRoleDto(
    string   Name,
    string[] Permissions,
    int[]    CompanyIds
);

public record UpdateRoleDto(
    int      Id,
    string   Name,
    string[] Permissions,
    int[]    CompanyIds
);
