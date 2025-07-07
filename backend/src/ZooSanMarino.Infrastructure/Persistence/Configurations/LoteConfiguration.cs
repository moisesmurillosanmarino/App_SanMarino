// src/ZooSanMarino.Infrastructure/Persistence/Configurations/LoteConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class LoteConfiguration : IEntityTypeConfiguration<Lote>
{
    public void Configure(EntityTypeBuilder<Lote> e)
    {
        e.ToTable("lotes");
        e.HasKey(x => x.LoteId);

        e.Property(x => x.LoteId)
         .HasColumnName("lote_id")
         .HasMaxLength(50);

        e.Property(x => x.LoteNombre)
         .HasColumnName("lote_nombre")
         .HasMaxLength(200)
         .IsRequired();

        e.Property(x => x.GranjaId)
         .HasColumnName("granja_id")
         .IsRequired();

        e.Property(x => x.NucleoId)
         .HasColumnName("nucleo_id");

        e.Property(x => x.GalponId)
         .HasColumnName("galpon_id");

        e.Property(x => x.Regional)
         .HasColumnName("regional")
         .HasMaxLength(100);

        e.Property(x => x.FechaEncaset)
         .HasColumnName("fecha_encaset");

        e.Property(x => x.HembrasL)
         .HasColumnName("hembras_l");

        e.Property(x => x.MachosL)
         .HasColumnName("machos_l");

        e.Property(x => x.PesoInicialH)
         .HasColumnName("peso_inicial_h");

        e.Property(x => x.PesoInicialM)
         .HasColumnName("peso_inicial_m");

        e.Property(x => x.UnifH)
         .HasColumnName("unif_h");

        e.Property(x => x.UnifM)
         .HasColumnName("unif_m");

        e.Property(x => x.MortCajaH)
         .HasColumnName("mort_caja_h");

        e.Property(x => x.MortCajaM)
         .HasColumnName("mort_caja_m");

        e.Property(x => x.Raza)
         .HasColumnName("raza")
         .HasMaxLength(100);

        e.Property(x => x.AnoTablaGenetica)
         .HasColumnName("ano_tabla_genetica");

        e.Property(x => x.Linea)
         .HasColumnName("linea")
         .HasMaxLength(100);

        e.Property(x => x.TipoLinea)
         .HasColumnName("tipo_linea")
         .HasMaxLength(100);

        e.Property(x => x.CodigoGuiaGenetica)
         .HasColumnName("codigo_guia_genetica")
         .HasMaxLength(100);

        e.Property(x => x.Tecnico)
         .HasColumnName("tecnico")
         .HasMaxLength(100);

        e.HasOne(x => x.Farm)
         .WithMany(f => f.Lotes)
         .HasForeignKey(x => x.GranjaId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
