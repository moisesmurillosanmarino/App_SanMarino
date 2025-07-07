// src/ZooSanMarino.Infrastructure/Persistence/Configurations/LoteGalponConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;
public class LoteGalponConfiguration : IEntityTypeConfiguration<LoteGalpon>
{
    public void Configure(EntityTypeBuilder<LoteGalpon> e)
    {
        e.ToTable("lote_galpones");
        e.HasKey(x => new { x.LoteId, x.ReproductoraId, x.GalponId });

        e.Property(x => x.LoteId)
         .HasColumnName("lote_id")
         .HasMaxLength(50);

        e.Property(x => x.ReproductoraId)
         .HasColumnName("reproductora_id")
         .HasMaxLength(50);

        e.Property(x => x.GalponId)
         .HasColumnName("galpon_id")
         .HasMaxLength(50);

        e.Property(x => x.M)
         .HasColumnName("macho");

        e.Property(x => x.H)
         .HasColumnName("hembra");

        e.HasOne(x => x.LoteReproductora)
         .WithMany(r => r.LoteGalpones)
         .HasForeignKey(x => new { x.LoteId, x.ReproductoraId })
         .OnDelete(DeleteBehavior.Cascade);

        e.HasOne(x => x.Galpon)
         .WithMany()
         .HasForeignKey(x => x.GalponId)
         .OnDelete(DeleteBehavior.Restrict);
    }
}
