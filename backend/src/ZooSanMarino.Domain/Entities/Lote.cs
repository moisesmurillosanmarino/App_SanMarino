// src/ZooSanMarino.Domain/Entities/Lote.cs
namespace ZooSanMarino.Domain.Entities;

public class Lote
{
    public string LoteId { get; set; } = null!;
    public string LoteNombre { get; set; } = null!;
    public int GranjaId { get; set; }
    public int? NucleoId { get; set; }  // NUEVO
    public int? GalponId { get; set; }  // NUEVO
    public string? Regional { get; set; }  // NUEVO
    public DateTime? FechaEncaset { get; set; }  // RENOMBRADO (antes FechaLlegada)
    public int? HembrasL { get; set; }  // Total de hembras
    public int? MachosL { get; set; }  // Total de machos
    public double? PesoInicialH { get; set; }  // NUEVO
    public double? PesoInicialM { get; set; }  // NUEVO
    public double? UnifH { get; set; }  // NUEVO
    public double? UnifM { get; set; }  // NUEVO
    public int? MortCajaH { get; set; }  // NUEVO
    public int? MortCajaM { get; set; }  // NUEVO
    public string? Raza { get; set; }
    public int? AnoTablaGenetica { get; set; }
    public string? Linea { get; set; }
    public string? TipoLinea { get; set; }  // NUEVO (Reproductora Pesada, Liviana, Pavos, etc.)
    public string? CodigoGuiaGenetica { get; set; }
    public string? Tecnico { get; set; }
    public int? Mixtas { get; set; }           // 🐥 Nuevas aves mixtas
    public double? PesoMixto { get; set; }     // 🐥 Peso promedio mixtas
    public int? AvesEncasetadas { get; set; }  // 🐣 Total encasetadas
    public int? EdadInicial { get; set; }      // 📅 Edad inicial en semanas

    public Farm Farm { get; set; } = null!; /// <summary>
                                            /// Colección de reproductoras asociadas a este lote
                                            /// (sitio donde configuras el WithMany(l => l.Reproductoras))
                                            /// </summary>
    public ICollection<LoteReproductora> Reproductoras { get; set; }
        = new List<LoteReproductora>();
    
}
