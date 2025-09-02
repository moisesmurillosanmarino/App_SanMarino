// SeguimientoLoteLevanteConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class SeguimientoLoteLevanteConfiguration : IEntityTypeConfiguration<SeguimientoLoteLevante>
{
    public void Configure(EntityTypeBuilder<SeguimientoLoteLevante> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityAlwaysColumn();

        builder.Property(x => x.LoteId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.TipoAlimento).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(1000);

        // Consumos y métricas con precisión
        builder.Property(x => x.ConsumoKgHembras).HasPrecision(12,3);
        builder.Property(x => x.KcalAlH).HasPrecision(12,3);
        builder.Property(x => x.ProtAlH).HasPrecision(12,3);
        builder.Property(x => x.KcalAveH).HasPrecision(12,3);
        builder.Property(x => x.ProtAveH).HasPrecision(12,3);

        builder.Property(x => x.Ciclo).HasMaxLength(50).HasDefaultValue("Normal");

        builder.HasOne(x => x.Lote)
               .WithMany()
               .HasForeignKey(x => x.LoteId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
