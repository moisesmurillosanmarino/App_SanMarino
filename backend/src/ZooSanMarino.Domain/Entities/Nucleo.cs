// src/ZooSanMarino.Domain/Entities/Nucleo.cs
namespace ZooSanMarino.Domain.Entities;
public class Nucleo
{
    // PK natural, según tu Excel
    public string NucleoId     { get; set; } = null!;  

    public int    GranjaId     { get; set; }
    public string NucleoNombre { get; set; } = null!;

    public Farm   Farm         { get; set; } = null!;

    // rel. 1:N Núcleo→Galpones
    public ICollection<Galpon> Galpones     { get; set; } = new List<Galpon>();
}
