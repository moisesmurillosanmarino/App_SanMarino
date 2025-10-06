// src/ZooSanMarino.Domain/Entities/ProduccionLote.cs
namespace ZooSanMarino.Domain.Entities;

public class ProduccionLote : AuditableEntity
{
    public int      Id                     { get; set; }
    public int LoteId { get; set; }
    public DateTime FechaInicioProduccion  { get; set; }

    public int  HembrasIniciales { get; set; }
    public int  MachosIniciales  { get; set; }
    public int  HuevosIniciales  { get; set; }
    public string TipoNido       { get; set; } = null!;

    // Jerarquía ubicación (coherente con el resto del dominio)
    public int     GranjaId   { get; set; }
    public string  NucleoId   { get; set; } = null!;  // ← antes NucleoProduccionId
    public string? GalponId   { get; set; }           // opcional si aplica

    public string Ciclo { get; set; } = "Normal";

    // Navegaciones
    public Lote   Lote   { get; set; } = null!;
    public Nucleo Nucleo { get; set; } = null!;
    public Galpon? Galpon { get; set; }
}
