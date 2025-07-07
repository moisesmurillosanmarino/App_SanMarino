// src/ZooSanMarino.Infrastructure/Persistence/Configurations/RoleCompanyConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class RoleCompanyConfiguration : IEntityTypeConfiguration<RoleCompany>
{
    public void Configure(EntityTypeBuilder<RoleCompany> e)
    {
        e.ToTable("role_companies");
        e.HasKey(rc => new { rc.RoleId, rc.CompanyId });

        e.HasOne(rc => rc.Company)
         .WithMany(c => c.RoleCompanies)
         .HasForeignKey(rc => rc.CompanyId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
