// src/ZooSanMarino.Infrastructure/Persistence/Configurations/LoteSeguimientoConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class LoteSeguimientoConfiguration : IEntityTypeConfiguration<LoteSeguimiento>
{
    public void Configure(EntityTypeBuilder<LoteSeguimiento> e)
    {
        e.ToTable("lote_seguimientos");
        e.HasKey(x => x.Id);

        e.Property(x => x.Fecha)
         .HasColumnName("fecha")
         .IsRequired();

        e.Property(x => x.LoteId)
         .HasColumnName("lote_id")
         .HasMaxLength(50)
         .IsRequired();

        e.Property(x => x.ReproductoraId)
         .HasColumnName("reproductora_id")
         .HasMaxLength(50)
         .IsRequired();

        e.Property(x => x.PesoInicial)
         .HasColumnName("peso_inicial");

        e.Property(x => x.PesoFinal)
         .HasColumnName("peso_final");

        e.Property(x => x.MortalidadM)
         .HasColumnName("mortalidad_m");

        e.Property(x => x.MortalidadH)
         .HasColumnName("mortalidad_h");

        e.Property(x => x.SelM)
         .HasColumnName("sel_m");

        e.Property(x => x.SelH)
         .HasColumnName("sel_h");

        e.Property(x => x.ErrorM)
         .HasColumnName("error_m");

        e.Property(x => x.ErrorH)
         .HasColumnName("error_h");

        e.Property(x => x.TipoAlimento)
         .HasColumnName("tipo_alimento")
         .HasMaxLength(100);

        e.Property(x => x.ConsumoAlimento)
         .HasColumnName("consumo_alimento");

        e.Property(x => x.Observaciones)
         .HasColumnName("observaciones")
         .HasMaxLength(500);

        e.HasOne(x => x.LoteReproductora)
         .WithMany(r => r.LoteSeguimientos)
         .HasForeignKey(x => new { x.LoteId, x.ReproductoraId })
         .OnDelete(DeleteBehavior.Cascade);
    }
}
