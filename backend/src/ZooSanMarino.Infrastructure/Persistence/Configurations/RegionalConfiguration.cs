// src/ZooSanMarino.Infrastructure/Persistence/Configurations/RegionalConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class RegionalConfiguration : IEntityTypeConfiguration<Regional>
{
    public void Configure(EntityTypeBuilder<Regional> e)
    {
        e.ToTable("regionales");
        e.HasKey(x => new { x.RegionalCia, x.RegionalId });
        e.Property(x => x.RegionalNombre)
         .HasMaxLength(200)
         .IsRequired();
        e.Property(x => x.RegionalEstado)
         .HasMaxLength(50)
         .IsRequired();
        e.Property(x => x.RegionalCodigo)
         .HasMaxLength(20)
         .IsRequired();

        e.HasOne(x => x.Company)
         .WithMany(c => c.Regionales)
         .HasForeignKey(x => x.RegionalCia)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
