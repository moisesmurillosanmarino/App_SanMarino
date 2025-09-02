// CompanyConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityAlwaysColumn();

        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Identifier).HasMaxLength(80).IsRequired();
        builder.Property(x => x.DocumentType).HasMaxLength(50).IsRequired();

        builder.Property(x => x.Address).HasMaxLength(200);
        builder.Property(x => x.Phone).HasMaxLength(50);
        builder.Property(x => x.Email).HasMaxLength(150);
        builder.Property(x => x.Country).HasMaxLength(80);
        builder.Property(x => x.State).HasMaxLength(80);
        builder.Property(x => x.City).HasMaxLength(80);

        // string[] en PostgreSQL → text[] por defecto (Npgsql)
        builder.Property(x => x.VisualPermissions).HasColumnType("text[]");

        builder.Property(x => x.MobileAccess).HasDefaultValue(false);
    }
}
