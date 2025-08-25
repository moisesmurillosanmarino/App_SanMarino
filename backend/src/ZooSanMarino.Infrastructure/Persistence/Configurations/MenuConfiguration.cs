using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations;

public class MenuConfiguration : IEntityTypeConfiguration<Menu>
{
    public void Configure(EntityTypeBuilder<Menu> e)
    {
        e.ToTable("menus");
        e.HasKey(m => m.Id);

        e.Property(m => m.Label).IsRequired().HasMaxLength(120);
        e.Property(m => m.Icon).HasMaxLength(80);
        e.Property(m => m.Route).HasMaxLength(200);
        e.Property(m => m.IsActive).HasDefaultValue(true);

        e.HasOne(m => m.Parent)
         .WithMany(p => p.Children)
         .HasForeignKey(m => m.ParentId)
         .OnDelete(DeleteBehavior.Restrict);

        e.HasMany(m => m.MenuPermissions)
         .WithOne(mp => mp.Menu)
         .HasForeignKey(mp => mp.MenuId);
    }
}
