// file: src/ZooSanMarino.Application/DTOs/Farms/FarmSearchRequest.cs
namespace ZooSanMarino.Application.DTOs.Farms;

public sealed record FarmSearchRequest(
    string? Search      = null,   // name/id
    int?    RegionalId  = null,
    int?    ZoneId      = null,
    string? Status      = null,   // "A", "I", etc.
    bool    SoloActivos = true,   // DeletedAt == null
    string  SortBy      = "name", // name | regional_id | zone_id | created_at
    bool    SortDesc    = false,
    int     Page        = 1,
    int     PageSize    = 20
);
