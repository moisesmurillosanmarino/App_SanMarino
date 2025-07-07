// src/ZooSanMarino.Infrastructure/Persistence/Configurations/FarmConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;
public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> e)
    {
        e.ToTable("farms");
        e.HasKey(f => f.Id);
        e.Property(f => f.Id)
         .ValueGeneratedOnAdd();

        e.Property(f => f.Name)
         .IsRequired()
         .HasMaxLength(200);

        e.Property(f => f.Status)
         .IsRequired()
         .HasMaxLength(50);

        // campos enteros: CompanyId, RegionalId, ZoneId
        e.Property(f => f.CompanyId)
         .IsRequired();
        e.Property(f => f.RegionalId)
         .IsRequired();
        e.Property(f => f.ZoneId)
         .IsRequired();
        // campo de fecha: LastUpdated
    }
}
