// src/ZooSanMarino.Domain/Entities/Role.cs

namespace ZooSanMarino.Domain.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;

        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();// Relacionamos con UserRole para manejar usuarios por rol
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>(); // Relacionamos con RolePermission para manejar permisos por rol
        public ICollection<RoleCompany>    RoleCompanies   { get; set; } = new List<RoleCompany>(); // Relacionamos con RoleCompany para manejar roles por empresa
    }
}