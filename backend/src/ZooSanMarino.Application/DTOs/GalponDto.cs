// src/ZooSanMarino.Application/DTOs/GalponDto.cs
namespace ZooSanMarino.Application.DTOs;
public record GalponDto(
    string GalponId,
    string GalponNombre,
    string GalponNucleoId,
    int    GranjaId,
    string? Ancho,
    string? Largo,
    string? TipoGalpon
);
