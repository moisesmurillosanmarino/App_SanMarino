using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations
{
    public class UserLoginConfiguration : IEntityTypeConfiguration<UserLogin>
    {
        public void Configure(EntityTypeBuilder<UserLogin> e)
        {
            e.ToTable("user_logins");

            e.HasKey(x => new { x.UserId, x.LoginId });

            e.HasOne(x => x.User)
             .WithMany(u => u.UserLogins)
             .HasForeignKey(x => x.UserId);

            e.HasOne(x => x.Login)
             .WithMany(l => l.UserLogins)
             .HasForeignKey(x => x.LoginId);
        }
    }
}
