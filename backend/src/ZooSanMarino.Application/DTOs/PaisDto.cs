// src/ZooSanMarino.Application/DTOs/PaisDto.cs
namespace ZooSanMarino.Application.DTOs;

public record PaisDto(
    int    PaisId,
    string PaisNombre
);

public record CreatePaisDto(
    int    PaisId,
    string PaisNombre
);

public record UpdatePaisDto(
    int    PaisId,
    string PaisNombre
);
