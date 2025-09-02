// NucleoConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class NucleoConfiguration : IEntityTypeConfiguration<Nucleo>
{
    public void Configure(EntityTypeBuilder<Nucleo> builder)
    {
        builder.HasKey(x => new { x.NucleoId, x.GranjaId });

        builder.Property(x => x.NucleoId).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NucleoNombre).HasMaxLength(150).IsRequired();

        builder.HasOne(x => x.Farm)
               .WithMany(f => f.Nucleos)
               .HasForeignKey(x => x.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
