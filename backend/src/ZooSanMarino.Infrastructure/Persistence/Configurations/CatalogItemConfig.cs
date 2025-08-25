using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class CatalogItemConfig : IEntityTypeConfiguration<CatalogItem>
{
    public void Configure(EntityTypeBuilder<CatalogItem> b)
    {
        b.ToTable("catalogo_items");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedOnAdd();

        b.Property(x => x.Codigo)
            .IsRequired()
            .HasMaxLength(10);

        b.Property(x => x.Nombre)
            .IsRequired()
            .HasMaxLength(150);

        b.HasIndex(x => x.Codigo).IsUnique();

        // jsonb
        b.Property(x => x.Metadata)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'{}'::jsonb");

        b.Property(x => x.Activo).HasDefaultValue(true);

        b.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("now()");

        b.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("now()");

        // Concurrencia: xmin (PostgreSQL)
        b.Property<uint>("xmin").HasColumnName("xmin").IsRowVersion();
    }
}
