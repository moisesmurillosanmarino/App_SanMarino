// src/ZooSanMarino.Infrastructure/Persistence/Configurations/NucleoConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;
public class NucleoConfiguration : IEntityTypeConfiguration<Nucleo>
{
    public void Configure(EntityTypeBuilder<Nucleo> e)
    {
        e.ToTable("nucleos");
        e.HasKey(n => new { n.NucleoId, n.GranjaId });

        e.Property(n => n.NucleoId)
         .HasColumnName("nucleo_id")
         .HasMaxLength(50);

        e.Property(n => n.GranjaId)
         .HasColumnName("granja_id");

        e.Property(n => n.NucleoNombre)
         .HasColumnName("nucleo_nombre")
         .IsRequired()
         .HasMaxLength(100);

        e.HasOne(n => n.Farm)
         .WithMany(f => f.Nucleos)
         .HasForeignKey(n => n.GranjaId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
