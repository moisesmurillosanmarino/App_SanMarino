// ZooSanMarino.Domain/Entities/Departamento.cs
namespace ZooSanMarino.Domain.Entities;

public class Departamento
{
    // PK simple en lugar de PK compuesta
    public int    DepartamentoId     { get; set; }

    // Nombre del departamento
    public string DepartamentoNombre { get; set; } = null!;

    // FK → Pais.PaisId
    public int    PaisId             { get; set; }

    // Nuevo campo de activo/inactivo
    public bool   Active             { get; set; }

    // Navegación
    public Pais   Pais               { get; set; } = null!;
    public ICollection<Municipio> Municipios { get; set; } = new List<Municipio>();
}
