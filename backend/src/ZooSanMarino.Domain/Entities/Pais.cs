namespace ZooSanMarino.Domain.Entities;
public class Pais
{
    public int    PaisId     { get; set; }       // PK
    public string PaisNombre{ get; set; } = null!;

    public ICollection<Departamento> Departamentos { get; set; } = new List<Departamento>();
}
