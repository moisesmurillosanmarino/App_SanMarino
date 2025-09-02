using System;
using System.Collections.Generic;
// Alias al único FarmLiteDto válido (el de Shared)
using FarmLiteDto = ZooSanMarino.Application.DTOs.Shared.FarmLiteDto;

namespace ZooSanMarino.Application.DTOs.Farms;

public sealed record NucleoNodeDto(
    string NucleoId,
    int    GranjaId,
    string NucleoNombre,
    int    GalponesCount,
    int    LotesCount
);

public sealed record FarmTreeDto(
    FarmLiteDto Farm,
    IReadOnlyList<NucleoNodeDto> Nucleos
);

public sealed record FarmDetailDto(
    int      Id,
    int      CompanyId,
    string   Name,
    int      RegionalId,
    string   Status,
    int      ZoneId,
    // Auditoría
    int      CreatedByUserId,
    DateTime CreatedAt,
    int?     UpdatedByUserId,
    DateTime? UpdatedAt,
    // Métricas
    int NucleosCount,
    int GalponesCount,
    int LotesCount
);
