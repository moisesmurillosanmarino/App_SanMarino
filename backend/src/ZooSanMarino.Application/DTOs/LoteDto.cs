// src/ZooSanMarino.Application/DTOs/LoteDto.cs
namespace ZooSanMarino.Application.DTOs;

public record LoteDto(
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

    // 👇 Campos agregados
    int?      Mixtas,
    double?   PesoMixto,
    int?      AvesEncasetadas,
    int?      EdadInicial,

    string?   Tecnico
);
