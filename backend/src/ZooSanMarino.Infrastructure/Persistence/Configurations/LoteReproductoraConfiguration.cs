using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class LoteReproductoraConfiguration : IEntityTypeConfiguration<LoteReproductora>
{
  public void Configure(EntityTypeBuilder<LoteReproductora> e)
  {
    e.ToTable("lote_reproductoras");
    e.HasKey(x => new { x.LoteId, x.ReproductoraId });

    e.Property(x => x.LoteId).HasColumnName("lote_id").HasMaxLength(50);
    e.Property(x => x.ReproductoraId).HasColumnName("reproductora_id").HasMaxLength(50);
    e.Property(x => x.NombreLote).HasColumnName("nombre_lote").HasMaxLength(200).IsRequired();
    e.Property(x => x.FechaEncasetamiento).HasColumnName("fecha_encasetamiento");

    e.Property(x => x.M).HasColumnName("macho");
    e.Property(x => x.H).HasColumnName("hembra");
    e.Property(x => x.Mixtas).HasColumnName("mixtas");             // 👈 nuevo

    e.Property(x => x.MortCajaH).HasColumnName("mort_caja_h");
    e.Property(x => x.MortCajaM).HasColumnName("mort_caja_m");
    e.Property(x => x.UnifH).HasColumnName("unif_h");
    e.Property(x => x.UnifM).HasColumnName("unif_m");

    e.Property(x => x.PesoInicialM).HasColumnName("peso_inicial_m").HasPrecision(10,2);
    e.Property(x => x.PesoInicialH).HasColumnName("peso_inicial_h").HasPrecision(10,2);
    e.Property(x => x.PesoMixto).HasColumnName("peso_mixto").HasPrecision(10,2); // 👈 nuevo

    e.HasOne(x => x.Lote)
     .WithMany(l => l.Reproductoras)
     .HasForeignKey(x => x.LoteId)
     .OnDelete(DeleteBehavior.Cascade);
  }
}
