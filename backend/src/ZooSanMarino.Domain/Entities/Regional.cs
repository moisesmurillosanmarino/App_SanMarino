namespace ZooSanMarino.Domain.Entities;
public class Regional
{
    public int    RegionalCia    { get; set; }   // FK → Company.Id
    public int    RegionalId     { get; set; }   // PK compuesta
    public string RegionalNombre { get; set; } = null!;
    public string RegionalEstado { get; set; } = null!;
    public string RegionalCodigo { get; set; } = null!;

    public Company Company        { get; set; } = null!;
}