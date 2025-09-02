// GalponConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class GalponConfiguration : IEntityTypeConfiguration<Galpon>
{
    public void Configure(EntityTypeBuilder<Galpon> builder)
    {
        builder.HasKey(x => x.GalponId);
        builder.Property(x => x.GalponId).HasMaxLength(50).IsRequired();

        builder.Property(x => x.NucleoId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.GalponNombre).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Ancho).HasMaxLength(50);
        builder.Property(x => x.Largo).HasMaxLength(50);
        builder.Property(x => x.TipoGalpon).HasMaxLength(100);

        builder.HasOne(x => x.Farm)
               .WithMany(f => f.Galpones)
               .HasForeignKey(x => x.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);

        // FK compuesta a Nucleo (NucleoId, GranjaId)
        builder.HasOne(x => x.Nucleo)
               .WithMany(n => n.Galpones)
               .HasForeignKey(x => new { x.NucleoId, x.GranjaId })
               .OnDelete(DeleteBehavior.Restrict);
    }
}
