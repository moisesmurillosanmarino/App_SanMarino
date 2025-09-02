// file: src/ZooSanMarino.Application/DTOs/Galpones/GalponDetailDto.cs
using ZooSanMarino.Application.DTOs.Shared;

namespace ZooSanMarino.Application.DTOs.Galpones;

public sealed record GalponDetailDto(
    string GalponId,
    string GalponNombre,
    string NucleoId,
    int GranjaId,
    string? Ancho,
    string? Largo,
    string? TipoGalpon,
    int CompanyId,
    int? CreatedByUserId,
    DateTime? CreatedAt,
    int? UpdatedByUserId,
    DateTime? UpdatedAt,
    FarmLiteDto Farm,
    NucleoLiteDto Nucleo,
    CompanyLiteDto Company  // 👈 NUEVO

);



