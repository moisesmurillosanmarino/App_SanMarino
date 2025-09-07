// ZooSanMarino.Domain/Entities/Farm.cs
namespace ZooSanMarino.Domain.Entities;

public class Farm : AuditableEntity
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Name { get; set; } = default!;
    public int RegionalId { get; set; }
    public string Status { get; set; } = "Activo";

    public int DepartamentoId { get; set; }   // antes ZoneId
    public int MunicipioId { get; set; }   // ← reemplaza CiudadId

    public ICollection<Nucleo> Nucleos { get; set; } = new List<Nucleo>();
    public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
    
    
    // NUEVO: para que compile WithMany(f => f.Galpones)
    public ICollection<Galpon> Galpones { get; set; } = new List<Galpon>();
}
