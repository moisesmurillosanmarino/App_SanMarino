namespace ZooSanMarino.Application.DTOs.Farms;

public sealed record FarmSearchRequest(
    string? Search        = null,   // name/id
    int?    RegionalId    = null,
    int?    DepartamentoId= null,   // ← nuevo filtro
    int?    CiudadId      = null,   // ← nuevo filtro
    string? Status        = null,   // "A", "I", etc.
    bool    SoloActivos   = true,   // DeletedAt == null
    string  SortBy        = "name", // name | regional_id | departamento_id | ciudad_id | created_at
    bool    SortDesc      = false,
    int     Page          = 1,
    int     PageSize      = 20
);

