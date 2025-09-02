/// file: backend/src/ZooSanMarino.Infrastructure/Persistence/Configurations/CatalogItemConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class CatalogItemConfiguration : IEntityTypeConfiguration<CatalogItem>
{
    public void Configure(EntityTypeBuilder<CatalogItem> e)
    {
        e.ToTable("catalogo_items");
        e.HasKey(x => x.Id);

        e.Property(x => x.Id).HasColumnName("id");

        e.Property(x => x.Codigo)
         .HasColumnName("codigo")
         .HasMaxLength(50)
         .IsRequired();

        e.Property(x => x.Nombre)
         .HasColumnName("nombre")
         .HasMaxLength(200)
         .IsRequired();

        e.Property(x => x.Metadata)
         .HasColumnName("metadata")
         .HasColumnType("jsonb");

        e.Property(x => x.Activo)
         .HasColumnName("activo")
         .HasDefaultValue(true);

        e.Property(x => x.CreatedAt)
         .HasColumnName("created_at")
         .HasDefaultValueSql("now()");

        e.Property(x => x.UpdatedAt)
         .HasColumnName("updated_at")
         .HasDefaultValueSql("now()");

        // 🔑 Único requerido por el seeder (ON CONFLICT (codigo))
        e.HasIndex(x => x.Codigo)
         .IsUnique()
         .HasDatabaseName("ux_catalogo_items_codigo");

        // índices auxiliares (opcionales)
        e.HasIndex(x => x.Nombre)
         .HasDatabaseName("ix_catalogo_items_nombre");
        e.HasIndex(x => x.Activo)
         .HasDatabaseName("ix_catalogo_items_activo");
    }
}
