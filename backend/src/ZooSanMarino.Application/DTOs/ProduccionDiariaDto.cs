// src/ZooSanMarino.Application/DTOs/PaisDto.cs
namespace ZooSanMarino.Application.DTOs;

public record ProduccionDiariaDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    double? PesoHuevo,
    int Etapa
);

public record CreateProduccionDiariaDto(
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    double? PesoHuevo,
    int Etapa
);

public record FilterProduccionDiariaDto(
    string? LoteId,
    DateTime? Desde,
    DateTime? Hasta
);
public record UpdateProduccionDiariaDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    double? PesoHuevo,
    int Etapa
);
public record ProduccionDiariaLoteDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    string Etapa
);
public record CreateProduccionDiariaLoteDto(
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    string Etapa
);
public record FilterProduccionDiariaLoteDto(
    string? LoteId,
    DateTime? Desde,
    DateTime? Hasta
);
public record UpdateProduccionDiariaLoteDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    string Etapa
);
public record ProduccionDiariaLoteFilterDto(
    string? LoteId,
    DateTime? Desde,
    DateTime? Hasta
);
public record ProduccionDiariaLoteCreateDto(
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    string Etapa
);
public record ProduccionDiariaLoteUpdateDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    double ConsKgH,
    double ConsKgM,
    int HuevoTot,
    int HuevoInc,
    string TipoAlimento,
    string? Observaciones,
    string Etapa
);