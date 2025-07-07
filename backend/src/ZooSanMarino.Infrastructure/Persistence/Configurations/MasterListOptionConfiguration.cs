// src/ZooSanMarino.Infrastructure/Persistence/Configurations/MasterListOptionConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class MasterListOptionConfiguration : IEntityTypeConfiguration<MasterListOption>
{
    public void Configure(EntityTypeBuilder<MasterListOption> e)
    {
        e.ToTable("master_list_options");
        e.HasKey(x => x.Id);
        e.Property(x => x.Value)
         .HasMaxLength(200)
         .IsRequired();
        e.Property(x => x.Order)
         .IsRequired();
    }
}
