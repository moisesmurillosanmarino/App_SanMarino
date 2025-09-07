using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
       public void Configure(EntityTypeBuilder<Farm> e)
       {
              e.ToTable("farms");

              e.HasKey(x => x.Id);
              e.Property(x => x.Id).HasColumnName("id");

              e.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
              e.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
              e.Property(x => x.RegionalId).HasColumnName("regional_id").IsRequired();
              e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired();

              // nuevos campos
              e.Property(x => x.DepartamentoId).HasColumnName("departamento_id").IsRequired();
              e.Property(x => x.MunicipioId).HasColumnName("municipio_id").IsRequired(); // ← MunicipioId

              // Auditoría
              e.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id");
              e.Property(x => x.CreatedAt).HasColumnName("created_at");
              e.Property(x => x.UpdatedByUserId).HasColumnName("updated_by_user_id");
              e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
              e.Property(x => x.DeletedAt).HasColumnName("deleted_at");

              // FKs
              e.HasOne<Departamento>()
                  .WithMany()
                  .HasForeignKey(x => x.DepartamentoId)
                  .HasConstraintName("fk_farms_departamento")
                  .OnDelete(DeleteBehavior.Restrict);

              e.HasOne<Municipio>()
                  .WithMany()
                  .HasForeignKey(x => x.MunicipioId)
                  .HasConstraintName("fk_farms_municipio")
                  .OnDelete(DeleteBehavior.Restrict);

              e.HasIndex(x => new { x.CompanyId, x.Name })
                  .HasDatabaseName("ix_farms_company_name")
                  .IsUnique(false);
            
              e.HasMany(f => f.Galpones)
                  .WithOne(g => g.Farm)
                  .HasForeignKey(g => g.GranjaId)
                  .OnDelete(DeleteBehavior.Restrict);
    }
}
