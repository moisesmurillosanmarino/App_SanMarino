namespace ZooSanMarino.Domain.Entities;

public class ProduccionLote
{
    public int Id { get; set; }
    public string LoteId { get; set; } = null!;
    public DateTime FechaInicioProduccion { get; set; }

    public int HembrasIniciales { get; set; }
    public int MachosIniciales { get; set; }
    public int HuevosIniciales { get; set; }

    public string TipoNido { get; set; } = null!;

    // Clave foránea compuesta
    public string NucleoProduccionId { get; set; } = null!;
    public int GranjaId { get; set; }

    public string Ciclo { get; set; } = "Normal";

    public Lote Lote { get; set; } = null!;
    public Nucleo NucleoProduccion { get; set; } = null!;
}
