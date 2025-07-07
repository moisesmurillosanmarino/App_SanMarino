// Zona.cs
namespace ZooSanMarino.Domain.Entities;
public class Zona
{
    public int    ZonaCia    { get; set; }      // FK → Company.Id
    public int    ZonaId     { get; set; }      // PK compuesta
    public string ZonaNombre { get; set; } = null!;
    public string ZonaEstado { get; set; } = null!;

    public Company Company    { get; set; } = null!;
}
