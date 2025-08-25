// src/ZooSanMarino.Infrastructure/Persistence/ZooSanMarinoContext.cs
using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Domain.Entities;

namespace ZooSanMarino.Infrastructure.Persistence
{
    public class ZooSanMarinoContext : DbContext
    {
        public ZooSanMarinoContext(DbContextOptions<ZooSanMarinoContext> options)
            : base(options)
        { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Farm>    Farms     { get; set; } = null!;
        public DbSet<Nucleo>  Nucleos   { get; set; } = null!;
        public DbSet<Galpon>  Galpones  { get; set; } = null!;
        public DbSet<Lote>             Lotes              { get; set; } = null!;
        public DbSet<LoteReproductora> LoteReproductoras  { get; set; } = null!;
        public DbSet<LoteGalpon>       LoteGalpones       { get; set; } = null!;
        public DbSet<Regional>     Regionales    { get; set; } = null!;
        public DbSet<Zona>         Zonas         { get; set; } = null!;
        public DbSet<Pais>         Paises        { get; set; } = null!;
        public DbSet<Departamento> Departamentos { get; set; } = null!;
        public DbSet<Municipio>    Municipios    { get; set; } = null!;
        public DbSet<LoteSeguimiento> LoteSeguimientos { get; set; } = null!;
        public DbSet<MasterList>       MasterLists       { get; set; } = null!;
        public DbSet<MasterListOption> MasterListOptions { get; set; } = null!;
        public DbSet<Role>        Roles        { get; set; } = null!;
        public DbSet<RoleCompany> RoleCompanies{ get; set; } = null!;
        public DbSet<SeguimientoLoteLevante> SeguimientoLoteLevante { get; set; } = null!;
        public DbSet<ProduccionLote> ProduccionLotes { get; set; } = null!;
        public DbSet<ProduccionDiaria> ProduccionDiaria { get; set; } = null!; 
        public DbSet<Login>           Logins           { get; set; } = null!;
        public DbSet<UserLogin>       UserLogins       { get; set; } = null!;
        public DbSet<UserCompany>     UserCompanies    { get; set; } = null!;
        public DbSet<UserRole>        UserRoles        { get; set; } = null!;
        public DbSet<Permission>      Permissions      { get; set; } = null!;
        public DbSet<RolePermission>  RolePermissions  { get; set; } = null!;
        public DbSet<Menu> Menus => Set<Menu>();
        public DbSet<MenuPermission> MenuPermissions => Set<MenuPermission>();
        public DbSet<CatalogItem> CatalogItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Aplica todas las configuraciones IEntityTypeConfiguration<T> automáticamente
            builder.ApplyConfigurationsFromAssembly(typeof(ZooSanMarinoContext).Assembly);
            base.OnModelCreating(builder);
        }

        // ---------------------------
        // Auditoría de UpdatedAt
        // ---------------------------
        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            SetAuditFields();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default)
        {
            SetAuditFields();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private void SetAuditFields()
        {
            var utcNow = DateTime.UtcNow;

            // 1) Setear UpdatedAt en entidades con esa shadow property cuando estén Added/Modified
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Metadata.FindProperty("UpdatedAt") is not null)
                {
                    if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                    {
                        entry.Property("UpdatedAt").CurrentValue = utcNow;
                    }
                }
            }

            // 2) Si solo se modifican relaciones de User, tocar UpdatedAt del User correspondiente
            //    para que refleje el cambio aunque no se haya modificado un campo simple.
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State != EntityState.Added &&
                    entry.State != EntityState.Modified &&
                    entry.State != EntityState.Deleted)
                {
                    continue;
                }

                switch (entry.Entity)
                {
                    case UserRole ur:
                        TouchUserUpdatedAt(ur.UserId, utcNow);
                        break;

                    case UserCompany uc:
                        TouchUserUpdatedAt(uc.UserId, utcNow);
                        break;

                    case UserLogin ul:
                        TouchUserUpdatedAt(ul.UserId, utcNow);
                        break;
                }
            }
        }

        private void TouchUserUpdatedAt(Guid userId, DateTime utcNow)
        {
            // Busca si el User ya está trackeado
            var trackedUserEntry = ChangeTracker.Entries<User>()
                .FirstOrDefault(e => e.Entity.Id == userId);

            if (trackedUserEntry is not null)
            {
                if (trackedUserEntry.Metadata.FindProperty("UpdatedAt") is not null)
                {
                    trackedUserEntry.Property("UpdatedAt").CurrentValue = utcNow;
                    // Marcar solo la propiedad de sombra para no forzar updates innecesarios
                    trackedUserEntry.Property("UpdatedAt").IsModified = true;
                }
                return;
            }

            // Si no está trackeado, adjunta un proxy ligero y marca UpdatedAt como modificado
            var proxy = new User { Id = userId };
            Attach(proxy);

            var prop = Entry(proxy).Property("UpdatedAt");
            if (prop != null)
            {
                prop.CurrentValue = utcNow;
                prop.IsModified = true;
            }
        }
    }
}
