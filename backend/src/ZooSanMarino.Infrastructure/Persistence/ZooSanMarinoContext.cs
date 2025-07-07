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





        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Aplica todas las configuraciones IEntityTypeConfiguration<T> automáticamente
            builder.ApplyConfigurationsFromAssembly(typeof(ZooSanMarinoContext).Assembly);

            base.OnModelCreating(builder);
        }
    }
}
