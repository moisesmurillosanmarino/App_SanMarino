using System;

namespace ZooSanMarino.Application.DTOs
{
    public record ProduccionLoteDto(
        int Id,
        int LoteId,
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
        int LoteId,
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
        int LoteId,
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
        int? LoteId,
        DateTime? Desde,
        DateTime? Hasta
    );
}
