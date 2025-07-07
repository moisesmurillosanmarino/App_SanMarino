// src/ZooSanMarino.Domain/Entities/RoleCompany.cs
namespace ZooSanMarino.Domain.Entities;

public class RoleCompany
{
    public int RoleId    { get; set; }
    public int CompanyId { get; set; }

    public Role    Role    { get; set; } = null!;
    public Company Company { get; set; } = null!;
}