// src/ZooSanMarino.Application/DTOs/CreateFarmDto.cs
namespace ZooSanMarino.Application.DTOs;
public record CreateFarmDto(
    int    CompanyId,
    string Name,
    int    RegionalId,
    string Status,
    int    ZoneId
);