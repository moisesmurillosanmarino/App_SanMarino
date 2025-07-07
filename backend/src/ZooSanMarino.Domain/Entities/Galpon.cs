// src/ZooSanMarino.Domain/Entities/Galpon.cs
namespace ZooSanMarino.Domain.Entities;
public class Galpon
{
    public string GalponId        { get; set; } = null!;
    public string GalponNucleoId  { get; set; } = null!;
    public int    GranjaId        { get; set; }

    public string GalponNombre    { get; set; } = null!;
    public string? Ancho          { get; set; }
    public string? Largo          { get; set; }
    public string? TipoGalpon     { get; set; }

    public Nucleo Nucleo          { get; set; } = null!;
    public Farm   Farm            { get; set; } = null!;
}
