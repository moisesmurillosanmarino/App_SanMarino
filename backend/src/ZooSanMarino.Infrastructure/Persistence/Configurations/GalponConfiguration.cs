// src/ZooSanMarino.Infrastructure/Persistence/Configurations/GalponConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;
public class GalponConfiguration : IEntityTypeConfiguration<Galpon>
{
    public void Configure(EntityTypeBuilder<Galpon> e)
    {
        e.ToTable("galpones");
        e.HasKey(g => g.GalponId);

        e.Property(g => g.GalponId)
         .HasColumnName("galpon_id")
         .HasMaxLength(50);

        e.Property(g => g.GalponNucleoId)
         .HasColumnName("galpon_nucleo_id")
         .HasMaxLength(50);

        e.Property(g => g.GranjaId)
         .HasColumnName("granja_id");

        e.Property(g => g.GalponNombre)
         .HasColumnName("galpon_nombre")
         .HasMaxLength(100)
         .IsRequired();

        e.Property(g => g.Ancho)
         .HasColumnName("ancho")
         .HasMaxLength(50);

        e.Property(g => g.Largo)
         .HasColumnName("largo")
         .HasMaxLength(50);

        e.Property(g => g.TipoGalpon)
         .HasColumnName("tipo_galpon")
         .HasMaxLength(100);

        // FKs
        e.HasOne(g => g.Nucleo)
         .WithMany(n => n.Galpones)
         .HasForeignKey(g => new { g.GalponNucleoId, g.GranjaId })
         .OnDelete(DeleteBehavior.Cascade);

        e.HasOne(g => g.Farm)
         .WithMany()
         .HasForeignKey(g => g.GranjaId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
