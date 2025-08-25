// src/ZooSanMarino.API/Extensions/DatabaseExtensions.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Persistence.Seed; // Seed_CatalogoItems
using ZooSanMarino.Infrastructure.Seed;            // PermissionSeed, MenuSeed

namespace ZooSanMarino.API.Extensions;

public static class DatabaseExtensions
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
                                         .CreateLogger("Startup:DB");

        try
        {
            var ctx = scope.ServiceProvider.GetRequiredService<ZooSanMarinoContext>();

            // 1) Migraciones
            await ctx.Database.MigrateAsync();

            // 2) Seeders idempotentes (ajusta el orden si alguno depende de otro)
            await PermissionSeed.EnsureAsync(ctx);
            await MenuSeed.EnsureAsync(ctx);
            await Seed_CatalogoItems.RunAsync(ctx, logger); 

            logger.LogInformation("✅ DB migrated & seeded");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Error migrating/seeding database");
            throw;
        }
    }
}
