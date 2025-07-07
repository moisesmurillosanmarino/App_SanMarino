// src/ZooSanMarino.Domain/Entities/Farm.cs
namespace ZooSanMarino.Domain.Entities;

public class Farm
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Name { get; set; } = null!;
    public int RegionalId { get; set; }
    public string Status { get; set; } = null!;
    public int ZoneId { get; set; }

    // Navegación
    public Company Company { get; set; } = null!;
    public ICollection<Nucleo> Nucleos { get; set; } = new List<Nucleo>();
    public ICollection<Lote>   Lotes   { get; set; } = new List<Lote>();
}
