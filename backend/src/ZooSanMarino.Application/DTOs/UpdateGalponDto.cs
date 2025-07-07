// src/ZooSanMarino.Application/DTOs/UpdateGalponDto.cs
namespace ZooSanMarino.Application.DTOs;
public record UpdateGalponDto(
    string GalponId,
    string GalponNombre,
    string GalponNucleoId,
    int    GranjaId,
    string? Ancho,
    string? Largo,
    string? TipoGalpon
);
