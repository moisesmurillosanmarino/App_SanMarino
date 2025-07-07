using System;

namespace ZooSanMarino.Application.DTOs
{
    public record ProduccionLoteDto(
        int Id,
        string LoteId,
        DateTime FechaInicioProduccion,
        int HembrasIniciales,
        int MachosIniciales,
        int HuevosIniciales,
        string TipoNido,
        string NucleoProduccionId, // es string según tu modelo
        int GranjaId,
        string Ciclo
    );

    public record CreateProduccionLoteDto(
        string LoteId,
        DateTime FechaInicioProduccion,
        int HembrasIniciales,
        int MachosIniciales,
        int HuevosIniciales,
        string TipoNido,
        string NucleoProduccionId,
        int GranjaId,
        string Ciclo
    );

    public record UpdateProduccionLoteDto(
        int Id,
        string LoteId,
        DateTime FechaInicioProduccion,
        int HembrasIniciales,
        int MachosIniciales,
        int HuevosIniciales,
        string TipoNido,
        string NucleoProduccionId,
        int GranjaId,
        string Ciclo
    );

    public record FilterProduccionLoteDto(
        string? LoteId,
        DateTime? Desde,
        DateTime? Hasta
    );
}
