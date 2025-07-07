using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations
{
    public class LoginConfiguration : IEntityTypeConfiguration<Login>
    {
        public void Configure(EntityTypeBuilder<Login> e)
        {
            e.ToTable("logins");

            e.HasKey(l => l.Id);

            e.Property(l => l.Id)
             .HasDefaultValueSql("gen_random_uuid()");

            e.Property(l => l.email)
             .IsRequired()
             .HasMaxLength(150);

            e.Property(l => l.PasswordHash)
             .IsRequired();

            e.Property(l => l.IsEmailLogin)
             .HasDefaultValue(true);

            e.Property(l => l.IsDeleted)
             .HasDefaultValue(false);

            // Relaciones
            e.HasMany(l => l.UserLogins)
             .WithOne(ul => ul.Login)
             .HasForeignKey(ul => ul.LoginId);
        }
    }
}
