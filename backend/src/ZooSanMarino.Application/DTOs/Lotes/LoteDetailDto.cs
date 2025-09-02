namespace ZooSanMarino.Application.DTOs.Lotes;

using FarmLiteDto   = ZooSanMarino.Application.DTOs.Shared.FarmLiteDto;
using NucleoLiteDto = ZooSanMarino.Application.DTOs.Shared.NucleoLiteDto;
using GalponLiteDto = ZooSanMarino.Application.DTOs.Shared.GalponLiteDto;

public sealed record LoteDetailDto(
    string    LoteId,
    string    LoteNombre,
    int       GranjaId,
    string?   NucleoId,
    string?   GalponId,
    string?   Regional,
    DateTime? FechaEncaset,
    int?      HembrasL,
    int?      MachosL,
    double?   PesoInicialH,
    double?   PesoInicialM,
    double?   UnifH,
    double?   UnifM,
    int?      MortCajaH,
    int?      MortCajaM,
    string?   Raza,
    int?      AnoTablaGenetica,
    string?   Linea,
    string?   TipoLinea,
    string?   CodigoGuiaGenetica,
    string?   Tecnico,
    int?      Mixtas,
    double?   PesoMixto,
    int?      AvesEncasetadas,
    int?      EdadInicial,
    // Auditoría
    int       CompanyId,
    int       CreatedByUserId,
    DateTime  CreatedAt,
    int?      UpdatedByUserId,
    DateTime? UpdatedAt,
    // Relaciones (tomadas de Shared)
    FarmLiteDto    Farm,
    NucleoLiteDto? Nucleo,
    GalponLiteDto? Galpon
);
