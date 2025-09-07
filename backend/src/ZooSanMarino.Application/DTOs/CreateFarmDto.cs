namespace ZooSanMarino.Application.DTOs;

public record CreateFarmDto(
    int    CompanyId,
    string Name,
    int    RegionalId,
    string Status,
    int    DepartamentoId,  // ← reemplaza ZoneId
    int    CiudadId         // ← nuevo
);
