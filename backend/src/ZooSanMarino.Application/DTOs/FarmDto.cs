// src/ZooSanMarino.Application/DTOs/FarmDto.cs
namespace ZooSanMarino.Application.DTOs;
public record FarmDto(
    int Id,
    int CompanyId,
    string Name,
    int RegionalId,
    string Status,
    int ZoneId
);