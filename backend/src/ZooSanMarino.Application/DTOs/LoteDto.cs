// src/ZooSanMarino.Application/DTOs/LoteDto.cs
namespace ZooSanMarino.Application.DTOs;

public record LoteDto(
    string   LoteId,
    string   LoteNombre,
    int      GranjaId,
    int?     NucleoId,
    int?     GalponId,
    string?  Regional,
    DateTime? FechaEncaset,
    int?     HembrasL,
    int?     MachosL,
    double?  PesoInicialH,
    double?  PesoInicialM,
    double?  UnifH,
    double?  UnifM,
    int?     MortCajaH,
    int?     MortCajaM,
    string?  Raza,
    int?     AnoTablaGenetica,
    string?  Linea,
    string?  TipoLinea,
    string?  CodigoGuiaGenetica,
    string?  Tecnico
);