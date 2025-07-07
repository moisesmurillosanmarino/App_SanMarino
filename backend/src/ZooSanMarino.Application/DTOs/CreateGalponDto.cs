// src/ZooSanMarino.Application/DTOs/CreateGalponDto.cs
namespace ZooSanMarino.Application.DTOs;
public record CreateGalponDto(
    string GalponId,
    string GalponNombre,
    string GalponNucleoId,
    int    GranjaId,
    string? Ancho,
    string? Largo,
    string? TipoGalpon
);
