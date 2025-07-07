// ZooSanMarino.Infrastructure/Persistence/Configurations/MunicipioConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class MunicipioConfiguration : IEntityTypeConfiguration<Municipio>
{
    public void Configure(EntityTypeBuilder<Municipio> builder)
    {
        builder.ToTable("municipios");

        builder.HasKey(m => m.MunicipioId)
               .HasName("pk_municipio");

        builder.Property(m => m.MunicipioId)
               .HasColumnName("municipio_id")
               .ValueGeneratedOnAdd();

        builder.Property(m => m.MunicipioNombre)
               .HasColumnName("municipio_nombre")
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(m => m.DepartamentoId)
               .HasColumnName("departamento_id")
               .IsRequired();

        builder.HasOne(m => m.Departamento)
               .WithMany(d => d.Municipios)
               .HasForeignKey(m => m.DepartamentoId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
