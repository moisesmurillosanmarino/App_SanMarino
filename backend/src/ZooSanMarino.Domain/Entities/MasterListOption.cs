// src/ZooSanMarino.Domain/Entities/MasterListOption.cs
namespace ZooSanMarino.Domain.Entities;

public class MasterListOption
{
    public int    Id           { get; set; }
    public int    MasterListId { get; set; }
    public string Value        { get; set; } = null!;
    public int    Order        { get; set; }  // Para mantener orden

    public MasterList MasterList { get; set; } = null!;
}
