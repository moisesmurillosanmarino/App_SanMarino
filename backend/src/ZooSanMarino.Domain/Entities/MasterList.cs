// src/ZooSanMarino.Domain/Entities/MasterList.cs
namespace ZooSanMarino.Domain.Entities;

public class MasterList
{
    public int    Id    { get; set; }
    public string Key   { get; set; } = null!;
    public string Name  { get; set; } = null!;

    public ICollection<MasterListOption> Options { get; set; } = new List<MasterListOption>();
}
