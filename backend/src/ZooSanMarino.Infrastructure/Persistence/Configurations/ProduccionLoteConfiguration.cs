using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

public class ProduccionLoteConfiguration : IEntityTypeConfiguration<ProduccionLote>
{
    public void Configure(EntityTypeBuilder<ProduccionLote> builder)
    {
        builder.ToTable("produccion_lotes");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.LoteId).HasColumnName("lote_id").HasMaxLength(50);
        builder.Property(x => x.FechaInicioProduccion).HasColumnName("fecha_inicio");

        builder.Property(x => x.HembrasIniciales).HasColumnName("hembras_iniciales");
        builder.Property(x => x.MachosIniciales).HasColumnName("machos_iniciales");
        builder.Property(x => x.HuevosIniciales).HasColumnName("huevos_iniciales");

        builder.Property(x => x.TipoNido).HasColumnName("tipo_nido").HasMaxLength(100);
        builder.Property(x => x.Ciclo).HasColumnName("ciclo").HasMaxLength(50);

        builder.Property(x => x.NucleoProduccionId).HasColumnName("nucleo_id");
        builder.Property(x => x.GranjaId).HasColumnName("granja_id");

        builder.HasOne(x => x.Lote)
               .WithMany()
               .HasForeignKey(x => x.LoteId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.NucleoProduccion)
               .WithMany()
               .HasForeignKey(x => new { x.NucleoProduccionId, x.GranjaId })
               .OnDelete(DeleteBehavior.Restrict);
    }
}
