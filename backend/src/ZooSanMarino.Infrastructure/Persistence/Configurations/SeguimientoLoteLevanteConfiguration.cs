using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class SeguimientoLoteLevanteConfiguration : IEntityTypeConfiguration<SeguimientoLoteLevante>
{
    public void Configure(EntityTypeBuilder<SeguimientoLoteLevante> e)
    {
        e.ToTable("seguimiento_lote_levante");
        e.HasKey(x => x.Id);

        e.Property(x => x.Id).HasColumnName("id");
        e.Property(x => x.LoteId).HasColumnName("lote_id").HasMaxLength(50).IsRequired();
        e.Property(x => x.FechaRegistro).HasColumnName("fecha_registro");

        e.Property(x => x.MortalidadHembras).HasColumnName("mortalidad_hembras");
        e.Property(x => x.MortalidadMachos).HasColumnName("mortalidad_machos");
        e.Property(x => x.SelH).HasColumnName("selh");
        e.Property(x => x.SelM).HasColumnName("selm");
        e.Property(x => x.ErrorSexajeHembras).HasColumnName("error_sexaje_hembras");
        e.Property(x => x.ErrorSexajeMachos).HasColumnName("error_sexaje_machos");

        e.Property(x => x.ConsumoKgHembras).HasColumnName("consumo_kg_hembras");
        e.Property(x => x.TipoAlimento).HasColumnName("tipo_alimento").HasMaxLength(100);
        e.Property(x => x.Observaciones).HasColumnName("observaciones");

        e.Property(x => x.KcalAlH).HasColumnName("kcal_alh");
        e.Property(x => x.ProtAlH).HasColumnName("prot_alh");
        e.Property(x => x.KcalAveH).HasColumnName("kcal_aveh");
        e.Property(x => x.ProtAveH).HasColumnName("prot_aveh");

        e.Property(x => x.Ciclo).HasColumnName("ciclo").HasMaxLength(50);

        e.HasOne(x => x.Lote)
         .WithMany()
         .HasForeignKey(x => x.LoteId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
