// src/ZooSanMarino.Infrastructure/Persistence/Configurations/MasterListConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class MasterListConfiguration : IEntityTypeConfiguration<MasterList>
{
    public void Configure(EntityTypeBuilder<MasterList> e)
    {
        e.ToTable("master_lists");
        e.HasKey(x => x.Id);
        e.HasIndex(x => x.Key).IsUnique();
        e.Property(x => x.Key)
         .HasMaxLength(100)
         .IsRequired();
        e.Property(x => x.Name)
         .HasMaxLength(200)
         .IsRequired();

        e.HasMany(x => x.Options)
         .WithOne(o => o.MasterList)
         .HasForeignKey(o => o.MasterListId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
