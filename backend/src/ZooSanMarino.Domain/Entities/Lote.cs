// src/ZooSanMarino.Domain/Entities/Lote.cs
namespace ZooSanMarino.Domain.Entities;

public class Lote : AuditableEntity
{
    public string LoteId      { get; set; } = null!;
    public string LoteNombre  { get; set; } = null!;

    public int     GranjaId  { get; set; }
    public string? NucleoId  { get; set; }   // ← unificado a string?
    public string? GalponId  { get; set; }   // ← unificado a string?

    public string?   Regional           { get; set; }
    public DateTime? FechaEncaset       { get; set; }
    public int?      HembrasL           { get; set; }
    public int?      MachosL            { get; set; }
    public double?   PesoInicialH       { get; set; }
    public double?   PesoInicialM       { get; set; }
    public double?   UnifH              { get; set; }
    public double?   UnifM              { get; set; }
    public int?      MortCajaH          { get; set; }
    public int?      MortCajaM          { get; set; }
    public string?   Raza               { get; set; }
    public int?      AnoTablaGenetica   { get; set; }
    public string?   Linea              { get; set; }
    public string?   TipoLinea          { get; set; }
    public string?   CodigoGuiaGenetica { get; set; }
    public string?   Tecnico            { get; set; }

    // Campos agregados previamente
    public int?    Mixtas          { get; set; }
    public double? PesoMixto       { get; set; }
    public int?    AvesEncasetadas { get; set; }
    public int?    EdadInicial     { get; set; }

    // Navegación
    public Farm    Farm   { get; set; } = null!;
    public Nucleo? Nucleo { get; set; }    // compuesta: (NucleoId, GranjaId)
    public Galpon? Galpon { get; set; }    // FK a GalponId

    // Reproductoras
    public List<LoteReproductora> Reproductoras { get; set; } = new();
}
