// src/ZooSanMarino.Domain/Entities/LoteReproductora.cs
namespace ZooSanMarino.Domain.Entities;

public class LoteReproductora
{
    public string    LoteId { get; set; } = null!;
    public string    ReproductoraId { get; set; } = null!;
    public string    NombreLote { get; set; } = null!;
    public DateTime? FechaEncasetamiento { get; set; }

    public int? M { get; set; }
    public int? H { get; set; }
    public int? Mixtas { get; set; }
    public int? MortCajaH { get; set; }
    public int? MortCajaM { get; set; }
    public int? UnifH { get; set; }
    public int? UnifM { get; set; }

    public decimal? PesoInicialM { get; set; }   // ya en decimal?
    public decimal? PesoInicialH { get; set; }   // ya en decimal?
    public decimal? PesoMixto    { get; set; }   // ← cambiar a decimal?

    public Lote Lote { get; set; } = null!;
    public List<LoteGalpon>      LoteGalpones { get; set; } = new();
    public List<LoteSeguimiento> LoteSeguimientos { get; set; } = new();
}
