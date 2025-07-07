// src/ZooSanMarino.Application/DTOs/CreateNucleoDto.cs
namespace ZooSanMarino.Application.DTOs;
public record CreateNucleoDto(
    int    GranjaId,
    string NucleoId,
    string NucleoNombre
);