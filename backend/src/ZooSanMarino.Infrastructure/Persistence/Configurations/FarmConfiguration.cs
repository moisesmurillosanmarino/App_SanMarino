// FarmConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityAlwaysColumn(); // Npgsql identidad

        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(1).HasDefaultValue("A").IsRequired();

        builder.HasOne(x => x.Company)
               .WithMany(c => c.Farms)
               .HasForeignKey(x => x.CompanyId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Nucleos)
               .WithOne(n => n.Farm)
               .HasForeignKey(n => n.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Galpones)
               .WithOne(g => g.Farm)
               .HasForeignKey(g => g.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Lotes)
               .WithOne(l => l.Farm)
               .HasForeignKey(l => l.GranjaId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
