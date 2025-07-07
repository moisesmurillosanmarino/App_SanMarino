// ZooSanMarino.Application/DTOs/DepartamentoDto.cs
namespace ZooSanMarino.Application.DTOs;

public record DepartamentoDto(
    int    DepartamentoId,
    string DepartamentoNombre,
    int    PaisId,
    bool   Active
);

public record CreateDepartamentoDto(
    string DepartamentoNombre,
    int    PaisId,
    bool   Active
);

public record UpdateDepartamentoDto(
    int    DepartamentoId,
    string DepartamentoNombre,
    int    PaisId,
    bool   Active
);
