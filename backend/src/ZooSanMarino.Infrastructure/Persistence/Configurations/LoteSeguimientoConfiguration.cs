// LoteSeguimientoConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class LoteSeguimientoConfiguration : IEntityTypeConfiguration<LoteSeguimiento>
{
    public void Configure(EntityTypeBuilder<LoteSeguimiento> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityAlwaysColumn();

        builder.Property(x => x.LoteId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ReproductoraId).HasMaxLength(50).IsRequired();

        builder.Property(x => x.TipoAlimento).HasMaxLength(100);
        builder.Property(x => x.Observaciones).HasMaxLength(1000);

        builder.Property(x => x.PesoInicial).HasPrecision(10, 2);
        builder.Property(x => x.PesoFinal).HasPrecision(10, 2);
        builder.Property(x => x.ConsumoAlimento).HasPrecision(12, 3);

        // FK a LoteReproductora (compuesta)
        builder.HasOne(x => x.LoteReproductora)
               .WithMany(r => r.LoteSeguimientos)
               .HasForeignKey(x => new { x.LoteId, x.ReproductoraId })
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Lote)
               .WithMany()
               .HasForeignKey(x => x.LoteId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
