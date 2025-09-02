// file: backend/src/ZooSanMarino.API/Extensions/DatabaseExtensions.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Seed; // PermissionSeed, MenuSeed

namespace ZooSanMarino.API.Extensions;

public static class DatabaseExtensions
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider
                          .GetRequiredService<ILoggerFactory>()
                          .CreateLogger("Startup:DB");

        try
        {
            var ctx = scope.ServiceProvider.GetRequiredService<ZooSanMarinoContext>();

            // 1) Migraciones (la migración crea/siembra catalogo_items)
            //await ctx.Database.MigrateAsync();

            // 2) Seeders idempotentes restantes
            await PermissionSeed.EnsureAsync(ctx);
            await MenuSeed.EnsureAsync(ctx);

            logger.LogInformation("✅ DB migrated & seeded (catalogo_items seeded via EF migration).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Error migrating/seeding database");
            throw;
        }
    }
}
