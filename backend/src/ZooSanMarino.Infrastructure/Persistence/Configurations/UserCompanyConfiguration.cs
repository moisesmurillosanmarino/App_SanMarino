using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence.Configurations
{
    public class UserCompanyConfiguration : IEntityTypeConfiguration<UserCompany>
    {
        public void Configure(EntityTypeBuilder<UserCompany> e)
        {
            e.ToTable("user_companies");

            e.HasKey(x => new { x.UserId, x.CompanyId });

            e.HasOne(x => x.User)
             .WithMany(u => u.UserCompanies)
             .HasForeignKey(x => x.UserId);

            e.HasOne(x => x.Company)
             .WithMany(c => c.UserCompanies)
             .HasForeignKey(x => x.CompanyId);
        }
    }
}
