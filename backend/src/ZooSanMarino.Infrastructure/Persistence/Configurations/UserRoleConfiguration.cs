using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> e)
    {
        e.ToTable("user_roles");

        e.HasKey(ur => new { ur.UserId, ur.RoleId, ur.CompanyId });

        e.HasOne(ur => ur.User)
         .WithMany(u => u.UserRoles)
         .HasForeignKey(ur => ur.UserId);

        e.HasOne(ur => ur.Role)
         .WithMany(r => r.UserRoles)
         .HasForeignKey(ur => ur.RoleId);

        e.HasOne(ur => ur.Company)
         .WithMany()
         .HasForeignKey(ur => ur.CompanyId);
    }
}
