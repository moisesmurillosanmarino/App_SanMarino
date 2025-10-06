// ProduccionLoteConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class ProduccionLoteConfiguration : IEntityTypeConfiguration<ProduccionLote>
{
    public void Configure(EntityTypeBuilder<ProduccionLote> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityAlwaysColumn();

        builder.Property(x => x.LoteId).IsRequired();
        builder.Property(x => x.TipoNido).HasMaxLength(100).IsRequired();
        builder.Property(x => x.NucleoId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.GalponId).HasMaxLength(50);

        builder.Property(x => x.Ciclo).HasMaxLength(50).HasDefaultValue("Normal");

        builder.HasOne(x => x.Lote)
               .WithMany()
               .HasForeignKey(x => x.LoteId)
               .OnDelete(DeleteBehavior.Restrict);

        // FK compuesta a Nucleo
        builder.HasOne(x => x.Nucleo)
               .WithMany()
               .HasForeignKey(x => new { x.NucleoId, x.GranjaId })
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Galpon)
               .WithMany()
               .HasForeignKey(x => x.GalponId)
               .OnDelete(DeleteBehavior.Restrict)
               .IsRequired(false);
    }
}
