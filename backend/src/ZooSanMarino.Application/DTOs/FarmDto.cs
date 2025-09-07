namespace ZooSanMarino.Application.DTOs;

public record FarmDto(
    int Id,
    int CompanyId,
    string Name,
    int RegionalId,
    string Status,
    int DepartamentoId,   // ← reemplaza ZoneId
    int CiudadId          // ← nuevo
);
