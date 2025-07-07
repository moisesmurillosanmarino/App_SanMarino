// src/ZooSanMarino.Domain/Entities/LoteGalpon.cs
namespace ZooSanMarino.Domain.Entities;
public class LoteGalpon
{
    public string   LoteId             { get; set; } = null!;  // FK → LoteReproductora.LoteId
    public string   ReproductoraId     { get; set; } = null!;  // FK → LoteReproductora.ReproductoraId
    public string   GalponId           { get; set; } = null!;  // FK → Galpon
    public int?     M                   { get; set; }
    public int?     H                   { get; set; }

    public LoteReproductora            LoteReproductora { get; set; } = null!;
    public Galpon                      Galpon           { get; set; } = null!;
}
