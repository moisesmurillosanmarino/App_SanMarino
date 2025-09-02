// LoteReproductoraConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class LoteReproductoraConfiguration : IEntityTypeConfiguration<LoteReproductora>
{
    public void Configure(EntityTypeBuilder<LoteReproductora> builder)
    {
        // PK compuesta
        builder.HasKey(x => new { x.LoteId, x.ReproductoraId });

        builder.Property(x => x.LoteId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ReproductoraId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NombreLote).HasMaxLength(150).IsRequired();

        // Decimales
        builder.Property(x => x.PesoInicialM).HasPrecision(10, 2);
        builder.Property(x => x.PesoInicialH).HasPrecision(10, 2);
        builder.Property(x => x.PesoMixto).HasPrecision(10, 2);

        builder.HasOne(x => x.Lote)
               .WithMany(l => l.Reproductoras)
               .HasForeignKey(x => x.LoteId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
