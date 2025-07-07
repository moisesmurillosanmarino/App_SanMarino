// src/ZooSanMarino.Application/DTOs/RegionalDto.cs
namespace ZooSanMarino.Application.DTOs;

public record RegionalDto(
    int    RegionalCia,
    int    RegionalId,
    string RegionalNombre,
    string RegionalEstado,
    string RegionalCodigo
);

public record CreateRegionalDto(
    int    RegionalCia,
    int    RegionalId,
    string RegionalNombre,
    string RegionalEstado,
    string RegionalCodigo
);

public record UpdateRegionalDto(
    int    RegionalCia,
    int    RegionalId,
    string RegionalNombre,
    string RegionalEstado,
    string RegionalCodigo
);
