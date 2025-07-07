// src/ZooSanMarino.Application/DTOs/NucleoDto.cs
namespace ZooSanMarino.Application.DTOs;
public record NucleoDto(
    string NucleoId,
    int    GranjaId,
    string NucleoNombre
);