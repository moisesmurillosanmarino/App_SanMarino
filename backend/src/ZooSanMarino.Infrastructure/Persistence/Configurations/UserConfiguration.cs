using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> e)
        {
            e.ToTable("users");

            e.HasKey(u => u.Id);

            e.Property(u => u.Id)
             .HasDefaultValueSql("gen_random_uuid()");

            e.Property(u => u.firstName)
             .IsRequired()
             .HasMaxLength(100);

            e.Property(u => u.surName)
             .IsRequired()
             .HasMaxLength(100);

            e.Property(u => u.cedula)
             .IsRequired()
             .HasMaxLength(50);

            e.Property(u => u.telefono)
             .IsRequired()
             .HasMaxLength(50);

            e.Property(u => u.ubicacion)
             .IsRequired()
             .HasMaxLength(100);

            e.Property(u => u.IsActive)
             .HasDefaultValue(true);

            e.Property(u => u.IsLocked)
             .HasDefaultValue(false);

            e.Property(u => u.FailedAttempts)
             .HasDefaultValue(0);

            e.Property(u => u.CreatedAt)
             .HasDefaultValueSql("now()");

            e.Property<DateTime>("UpdatedAt")
             .IsRequired();

            // Relaciones
            e.HasMany(u => u.UserLogins)
             .WithOne(ul => ul.User)
             .HasForeignKey(ul => ul.UserId);

            e.HasMany(u => u.UserCompanies)
             .WithOne(uc => uc.User)
             .HasForeignKey(uc => uc.UserId);

            e.HasMany(u => u.UserRoles)
             .WithOne(ur => ur.User)
             .HasForeignKey(ur => ur.UserId);
        }
    }
}
