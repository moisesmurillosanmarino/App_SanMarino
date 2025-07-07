// DTOs/ZoneDto.cs
namespace ZooSanMarino.Application.DTOs;
public record ZonaDto(int ZonaCia, int ZonaId, string ZonaNombre, string ZonaEstado);
public record CreateZonaDto(int ZonaCia, int ZonaId, string ZonaNombre, string ZonaEstado);
public record UpdateZonaDto(int ZonaCia, int ZonaId, string ZonaNombre, string ZonaEstado);
