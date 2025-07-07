// src/ZooSanMarino.Application/DTOs/UpdateFarmDto.cs
namespace ZooSanMarino.Application.DTOs;
public record UpdateFarmDto(
    int    Id,
    int    CompanyId,
    string Name,
    int    RegionalId,
    string Status,
    int    ZoneId
);