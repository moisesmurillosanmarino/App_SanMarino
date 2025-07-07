using System;

namespace ZooSanMarino.Domain.Entities;

public class ProduccionDiaria
{
    public int Id { get; set; }

    public string LoteId { get; set; } = null!;
    public DateTime FechaRegistro { get; set; }

    public int MortalidadHembras { get; set; }
    public int MortalidadMachos { get; set; }

    public int SelH { get; set; }  // antes mal definido como 'SelHembras'

    public double ConsKgH { get; set; }  // Consumo hembras
    public double ConsKgM { get; set; }  // Consumo machos

    public int HuevoTot { get; set; }
    public int HuevoInc { get; set; }

    public string TipoAlimento { get; set; } = null!;
    public string? Observaciones { get; set; }

    public double? PesoHuevo { get; set; }

    public int Etapa { get; set; }

    // Relación con ProduccionLote si la necesitas
    public ProduccionLote? LoteProduccion { get; set; }
}
