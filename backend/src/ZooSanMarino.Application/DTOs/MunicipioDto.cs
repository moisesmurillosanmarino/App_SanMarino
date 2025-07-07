// ZooSanMarino.Application/DTOs/MunicipioDto.cs
namespace ZooSanMarino.Application.DTOs;

public record MunicipioDto(
    int MunicipioId,
    string MunicipioNombre,
    int DepartamentoId
);

public record CreateMunicipioDto(
    string MunicipioNombre,
    int DepartamentoId
);

public record UpdateMunicipioDto(
    int MunicipioId,
    string MunicipioNombre,
    int DepartamentoId
);
