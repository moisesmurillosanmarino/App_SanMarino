namespace ZooSanMarino.Domain.Entities;

public class SeguimientoLoteLevante
{
    public int Id { get; set; }
    public string LoteId { get; set; } = null!;
    public DateTime FechaRegistro { get; set; }

    public int MortalidadHembras { get; set; }
    public int MortalidadMachos { get; set; }
    public int SelH { get; set; }
    public int SelM { get; set; }
    public int ErrorSexajeHembras { get; set; }
    public int ErrorSexajeMachos { get; set; }

    public double ConsumoKgHembras { get; set; }
    public string TipoAlimento { get; set; } = null!;
    public string? Observaciones { get; set; }

    public double? KcalAlH { get; set; }
    public double? ProtAlH { get; set; }
    public double? KcalAveH { get; set; }
    public double? ProtAveH { get; set; }
    public DateTime? FechaUltimoCambio { get; set; }

    public string Ciclo { get; set; } = "Normal";

    public Lote Lote { get; set; } = null!;
    public User? Usuario { get; set; }
}
