// src/ZooSanMarino.Infrastructure/Persistence/Configurations/CompanyConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> e)
    {
         e.ToTable("companies");
        e.HasKey(c => c.Id);

        // Número de documento
        e.Property(c => c.Identifier)
        .HasColumnName("identifier")
        .HasMaxLength(100)
        .IsRequired();

        // Tipo de documento
        e.Property(c => c.DocumentType)
        .HasColumnName("document_type")
        .HasMaxLength(50)
        .IsRequired();

        e.Property(c => c.Name)
         .HasColumnName("name")
         .HasMaxLength(200)
         .IsRequired();

        e.Property(c => c.Identifier)
         .HasColumnName("identifier")
         .HasMaxLength(50)
         .IsRequired();

        e.Property(c => c.Address)
         .HasColumnName("address")
         .HasMaxLength(300);

        e.Property(c => c.Phone)
         .HasColumnName("phone")
         .HasMaxLength(50);

        e.Property(c => c.Email)
         .HasColumnName("email")
         .HasMaxLength(200);

        e.Property(c => c.Country)
         .HasColumnName("country")
         .HasMaxLength(50);

        e.Property(c => c.State)
         .HasColumnName("state")
         .HasMaxLength(100);

        e.Property(c => c.City)
         .HasColumnName("city")
         .HasMaxLength(100);

        e.Property(c => c.VisualPermissions)
         .HasColumnName("visual_permissions")
         .HasColumnType("text[]")
         .IsRequired();

        e.Property(c => c.MobileAccess)
         .HasColumnName("mobile_access")
         .IsRequired();
        
        // Relaciones N:M con roles, granjas, etc.
    }
}
