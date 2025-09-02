// LoteConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class LoteConfiguration : IEntityTypeConfiguration<Lote>
{
    public void Configure(EntityTypeBuilder<Lote> builder)
    {
        builder.HasKey(x => x.LoteId);
        builder.Property(x => x.LoteId).HasMaxLength(50).IsRequired();

        builder.Property(x => x.LoteNombre).HasMaxLength(150).IsRequired();
        builder.Property(x => x.NucleoId).HasMaxLength(50);
        builder.Property(x => x.GalponId).HasMaxLength(50);

        builder.Property(x => x.Raza).HasMaxLength(80);
        builder.Property(x => x.Linea).HasMaxLength(80);
        builder.Property(x => x.TipoLinea).HasMaxLength(80);
        builder.Property(x => x.CodigoGuiaGenetica).HasMaxLength(80);
        builder.Property(x => x.Tecnico).HasMaxLength(120);
        builder.Property(x => x.Regional).HasMaxLength(80);

        builder.HasOne(x => x.Farm)
               .WithMany(f => f.Lotes)
               .HasForeignKey(x => x.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);

        // FK compuesta opcional a Nucleo
        builder.HasOne(x => x.Nucleo)
               .WithMany(n => n.Lotes)
               .HasForeignKey(x => new { x.NucleoId, x.GranjaId })
               .OnDelete(DeleteBehavior.Restrict)
               .IsRequired(false);

        // FK opcional a Galpon
        builder.HasOne(x => x.Galpon)
               .WithMany()
               .HasForeignKey(x => x.GalponId)
               .OnDelete(DeleteBehavior.Restrict)
               .IsRequired(false);

        builder.HasMany(x => x.Reproductoras)
               .WithOne(r => r.Lote)
               .HasForeignKey(r => r.LoteId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
