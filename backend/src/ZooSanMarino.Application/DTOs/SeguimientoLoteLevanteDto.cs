namespace ZooSanMarino.Application.DTOs;

public record SeguimientoLoteLevanteDto(
    int Id,
    string LoteId,
    DateTime FechaRegistro,
    int MortalidadHembras,
    int MortalidadMachos,
    int SelH,
    int SelM,
    int ErrorSexajeHembras,
    int ErrorSexajeMachos,
    double ConsumoKgHembras,
    string TipoAlimento,
    string? Observaciones,
    double? KcalAlH,
    double? ProtAlH,
    double? KcalAveH,
    double? ProtAveH,
    string Ciclo
);
