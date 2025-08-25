namespace ZooSanMarino.Domain.Entities;

public class LoteReproductora
{
   public string    LoteId { get; set; } = null!;
    public string    ReproductoraId { get; set; } = null!;
    public string    NombreLote { get; set; } = null!;
    public DateTime? FechaEncasetamiento { get; set; }

    public int? M { get; set; }              // Machos
    public int? H { get; set; }              // Hembras
    public int? Mixtas { get; set; }         // 👈 NUEVO

    public int? MortCajaH { get; set; }
    public int? MortCajaM { get; set; }
    public int? UnifH { get; set; }
    public int? UnifM { get; set; }

    public decimal? PesoInicialM { get; set; }
    public decimal? PesoInicialH { get; set; }
    public decimal? PesoMixto { get; set; }  // 👈 NUEVO

    public Lote Lote { get; set; } = null!;
    public ICollection<LoteGalpon> LoteGalpones { get; set; } = new List<LoteGalpon>();
    public ICollection<LoteSeguimiento> LoteSeguimientos { get; set; } = new List<LoteSeguimiento>();
}
