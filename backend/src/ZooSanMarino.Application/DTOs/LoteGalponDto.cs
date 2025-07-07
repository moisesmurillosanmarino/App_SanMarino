// src/ZooSanMarino.Application/DTOs/LoteGalponDto.cs
namespace ZooSanMarino.Application.DTOs;
public record LoteGalponDto(
    string   LoteId,
    string   ReproductoraId,
    string   GalponId,
    int?     M,
    int?     H
);

public record CreateLoteGalponDto(
    string   LoteId,
    string   ReproductoraId,
    string   GalponId,
    int?     M,
    int?     H
);

public record UpdateLoteGalponDto(
    string   LoteId,
    string   ReproductoraId,
    string   GalponId,
    int?     M,
    int?     H
);
