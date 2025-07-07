namespace ZooSanMarino.Domain.Entities;
public class ProduccionDiariaLote
{
    public int Id { get; set; }
    public string LoteId { get; set; } = null!;
    public DateTime FechaRegistro { get; set; }

    public int MortalidadHembras { get; set; }
    public int MortalidadMachos { get; set; }
    public int SelHembras { get; set; }

    public double ConsumoKgHembras { get; set; }
    public double ConsumoKgMachos { get; set; }

    public int HuevoTotal { get; set; }
    public int HuevoIncubable { get; set; }
    public double PesoHuevo { get; set; }

    public string TipoAlimento { get; set; } = null!;
    public string Observaciones { get; set; } = null!;
    public string Etapa { get; set; } = "1";

    public ProduccionLote ProduccionLote { get; set; } = null!;
}
