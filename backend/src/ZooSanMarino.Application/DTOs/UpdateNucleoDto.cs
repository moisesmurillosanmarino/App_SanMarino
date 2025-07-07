// src/ZooSanMarino.Application/DTOs/UpdateNucleoDto.cs
namespace ZooSanMarino.Application.DTOs;
public record UpdateNucleoDto(
    int    GranjaId,
    string NucleoId,
    string NucleoNombre
);