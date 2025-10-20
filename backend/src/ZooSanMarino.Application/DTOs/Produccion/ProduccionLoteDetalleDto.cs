// src/ZooSanMarino.Application/DTOs/Produccion/ProduccionLoteDetalleDto.cs
namespace ZooSanMarino.Application.DTOs.Produccion;

public record ProduccionLoteDetalleDto(
    int Id,
    int LoteId,
    DateTime FechaInicio,
    int AvesInicialesH,
    int AvesInicialesM,
    string? Observaciones,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);



