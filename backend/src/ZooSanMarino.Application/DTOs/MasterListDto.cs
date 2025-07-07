// src/ZooSanMarino.Application/DTOs/MasterListDto.cs
namespace ZooSanMarino.Application.DTOs;

public record MasterListDto(
    int      Id,
    string   Key,
    string   Name,
    IEnumerable<string> Options
);

public record CreateMasterListDto(
    string   Key,
    string   Name,
    IEnumerable<string> Options
);

public record UpdateMasterListDto(
    int      Id,
    string   Key,
    string   Name,
    IEnumerable<string> Options
);
