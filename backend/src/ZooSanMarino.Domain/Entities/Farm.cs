// src/ZooSanMarino.Domain/Entities/Farm.cs
namespace ZooSanMarino.Domain.Entities;

public class Farm : AuditableEntity
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;
    public int RegionalId { get; set; }
    public string Status { get; set; } = "A";
    public int ZoneId { get; set; }

    public int CompanyId { get; set; }  // <- SIN "new"
    public Company? Company { get; set; }

    public List<Nucleo> Nucleos { get; set; } = new();
    public List<Galpon> Galpones { get; set; } = new();
    public List<Lote> Lotes { get; set; } = new();
}
