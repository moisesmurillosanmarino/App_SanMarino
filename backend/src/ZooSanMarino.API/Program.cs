// file: backend/src/ZooSanMarino.API/Program.cs
using System.Text;
using System.Text.RegularExpressions;
using EFCore.NamingConventions;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using ZooSanMarino.API.Extensions;            // MigrateAndSeedAsync (si la usas)
using ZooSanMarino.API.Infrastructure;        // HttpCurrentUser
using ZooSanMarino.Application.Interfaces;     // ICurrentUser + servicios
using ZooSanMarino.Application.Options;        // JwtOptions
using ZooSanMarino.Application.Validators;     // SeguimientoLoteLevanteDtoValidator
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Providers;   // EfAlimentoNutricionProvider / NullGramajeProvider
using ZooSanMarino.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────
// 0) Cargar .env (antes de AddEnvironmentVariables)
//    y shim de ZOO_CONN → ConnectionStrings__ZooSanMarinoContext
// ─────────────────────────────────────
static void LoadDotEnvIfExists(string path)
{
    if (!File.Exists(path)) return;
    foreach (var raw in File.ReadAllLines(path))
    {
        var line = raw.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var idx = line.IndexOf('=');
        if (idx <= 0) continue;

        var key = line[..idx].Trim();
        var val = line[(idx + 1)..].Trim();

        if ((val.StartsWith("\"") && val.EndsWith("\"")) || (val.StartsWith("'") && val.EndsWith("'")))
            val = val[1..^1];

        Environment.SetEnvironmentVariable(key, val);
    }
}

var envPaths = new[]
{
    Path.Combine(builder.Environment.ContentRootPath, ".env"),              // src/ZooSanMarino.API/.env
    Path.Combine(builder.Environment.ContentRootPath, "..", ".env"),        // backend/src/.env
    Path.Combine(builder.Environment.ContentRootPath, "..", "..", ".env"),  // backend/.env
};
foreach (var p in envPaths) LoadDotEnvIfExists(Path.GetFullPath(p));

// Shim legacy
var legacyConn = Environment.GetEnvironmentVariable("ZOO_CONN");
if (!string.IsNullOrWhiteSpace(legacyConn))
{
    Environment.SetEnvironmentVariable("ConnectionStrings__ZooSanMarinoContext", legacyConn);
}

// ─────────────────────────────────────
// 1) Config (JSON → ENV); ENV sobreescribe
// ─────────────────────────────────────
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// ─────────────────────────────────────
// 2) Puerto
// ─────────────────────────────────────
var port = builder.Configuration["PORT"] ?? "5002";
builder.WebHost.UseUrls($"http://+:{port}");

// ─────────────────────────────────────
// 3) Conexión a BD (con fallbacks)
// ─────────────────────────────────────
var conn =
    builder.Configuration.GetConnectionString("ZooSanMarinoContext")
    ?? builder.Configuration["ConnectionStrings:ZooSanMarinoContext"]
    ?? builder.Configuration["ZOO_CONN"]
    ?? Environment.GetEnvironmentVariable("ZOO_CONN");

if (string.IsNullOrWhiteSpace(conn))
    throw new InvalidOperationException("ConnectionStrings:ZooSanMarinoContext no está configurada (revisa .env y/o appsettings).");

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// ─────────────────────────────────────
// 4) JWT
// ─────────────────────────────────────
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtSettings"));
var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtOptions>() ?? new JwtOptions();
jwt.EnsureValid();
builder.Services.AddSingleton(jwt);

// ─────────────────────────────────────
// 5) CORS (desde AllowedOrigins en appsettings)
// ─────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCorsFromOrigins("AppCors", allowedOrigins);

// ─────────────────────────────────────
/* 6) DbContext */
// ─────────────────────────────────────
builder.Services.AddDbContext<ZooSanMarinoContext>(opts =>
    opts.UseSnakeCaseNamingConvention()
        .UseNpgsql(conn));

// ─────────────────────────────────────
// 7) Infra básica
// ─────────────────────────────────────
builder.Services.AddScoped<IPasswordHasher<Login>, PasswordHasher<Login>>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();

// ─────────────────────────────────────
// 8) Servicios de aplicación/infra
// ─────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IFarmService, FarmService>();
builder.Services.AddScoped<INucleoService, NucleoService>();
builder.Services.AddScoped<IGalponService, GalponService>();
builder.Services.AddScoped<ILoteService, LoteService>();
builder.Services.AddScoped<ILoteReproductoraService, LoteReproductoraService>();
builder.Services.AddScoped<ILoteGalponService, LoteGalponService>();
builder.Services.AddScoped<IRegionalService, RegionalService>();
builder.Services.AddScoped<IPaisService, PaisService>();
builder.Services.AddScoped<IDepartamentoService, DepartamentoService>();
builder.Services.AddScoped<IMunicipioService, MunicipioService>();
builder.Services.AddScoped<ILoteSeguimientoService, LoteSeguimientoService>();
builder.Services.AddScoped<IMasterListService, MasterListService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ISeguimientoLoteLevanteService, SeguimientoLoteLevanteService>();
builder.Services.AddScoped<IProduccionLoteService, ProduccionLoteService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IMenuService,  MenuService>(); // o AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<ICatalogItemService, CatalogItemService>();
builder.Services.AddScoped<IFarmInventoryService, FarmInventoryService>();
builder.Services.AddScoped<IFarmInventoryMovementService, FarmInventoryMovementService>();

// Proveedores (ajusta cuando tengas provider real de gramaje)
builder.Services.AddScoped<IAlimentoNutricionProvider, EfAlimentoNutricionProvider>();
builder.Services.AddScoped<IGramajeProvider, NullGramajeProvider>();

// ─────────────────────────────────────
// 9) FluentValidation + HealthChecks
// ─────────────────────────────────────
builder.Services.AddValidatorsFromAssemblyContaining<SeguimientoLoteLevanteDtoValidator>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddHealthChecks();

// ─────────────────────────────────────
// 10) Auth (JWT) — ignora preflight OPTIONS
// ─────────────────────────────────────
var keyBytes = Encoding.UTF8.GetBytes(jwt.Key ?? "");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.Zero
        };

        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                // Evitar ruido con preflight
                if (HttpMethods.IsOptions(ctx.Request.Method)) ctx.NoResult();
                return Task.CompletedTask;
            }
        };
    });

// ─────────────────────────────────────
// 11) Authorization (ejemplo de políticas)
// ─────────────────────────────────────
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("CanManageUsers", p => p.RequireClaim("permission", "manage_users"));
    opt.AddPolicy("CanManageMenus", p => p.RequireClaim("permission", "manage_menus"));
    opt.AddPolicy("CanManageRoles", p => p.RequireClaim("permission", "manage_roles"));
});

// ─────────────────────────────────────
// 12) Swagger + Bearer
// ─────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ZooSanMarino", Version = "v1" });

    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme, // "bearer"
        BearerFormat = "JWT",
        Description = "Pega SOLO el token (Swagger añadirá 'Bearer ').",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = JwtBearerDefaults.AuthenticationScheme
        }
    };

    c.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { scheme, Array.Empty<string>() } });
});

// ─────────────────────────────────────
/* 13) Controllers */
// ─────────────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

// ─────────────────────────────────────
// 14) Pipeline HTTP
// ─────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    c.DisplayRequestDuration();
});

app.UseRouting();
app.UseCors("AppCors");
app.UseAuthentication();
app.UseAuthorization();

// Health
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapHealthChecks("/hc");

// Debug JWT
app.MapGet("/debug/jwt", (IOptions<JwtOptions> opt) =>
{
    var o = opt.Value;
    string Mask(string s) => string.IsNullOrEmpty(s) ? "" : $"{s[..Math.Min(4, s.Length)]}***{s[^Math.Min(4, s.Length)..]}";
    return Results.Ok(new
    {
        Issuer = o.Issuer,
        Audience = o.Audience,
        Duration = o.DurationInMinutes,
        KeyMasked = Mask(o.Key ?? ""),
        KeyLength = o.Key?.Length ?? 0
    });
});

// Debug ConnectionString
app.MapGet("/debug/config/conn", (IConfiguration cfg) =>
{
    var raw = cfg.GetConnectionString("ZooSanMarinoContext")
           ?? cfg["ConnectionStrings:ZooSanMarinoContext"]
           ?? cfg["ZOO_CONN"];

    var safe = string.IsNullOrEmpty(raw)
        ? ""
        : Regex.Replace(raw, "(Password=)([^;]+)", "$1******", RegexOptions.IgnoreCase);

    return Results.Ok(new { ConnectionString = safe });
});

// Ping DB (no toca esquema)
app.MapGet("/db-ping", async (ZooSanMarinoContext ctx) =>
{
    try
    {
        await ctx.Database.OpenConnectionAsync();
        await ctx.Database.CloseConnectionAsync();
        return Results.Ok(new { status = "ok", db = "reachable" });
    }
    catch (Exception ex)
    {
        return Results.Problem($"DB unreachable: {ex.Message}");
    }
});

// Catch-all OPTIONS
app.MapMethods("{*path}", new[] { "OPTIONS" }, () => Results.Ok()).RequireCors("AppCors");

// ─────────────────────────────────────
// 15) Migrar + Seed controlados por config
// ─────────────────────────────────────
bool runMigrations = app.Configuration.GetValue<bool>("Database:RunMigrations");
bool runSeed       = app.Configuration.GetValue<bool>("Database:RunSeed");

if (runMigrations || runSeed)
{
    // Si tu extensión soporta flags, usa esa sobrecarga:
    // await app.MigrateAndSeedAsync(runMigrations, runSeed);
    await app.MigrateAndSeedAsync();
}

// ─────────────────────────────────────
// 16) Controllers
// ─────────────────────────────────────
app.MapControllers();
app.Run();


// ─────────────────────────────────────
// Extensión: CORS desde lista de orígenes
// ─────────────────────────────────────
internal static class CorsExtensions
{
    public static void AddCorsFromOrigins(this IServiceCollection services, string policyName, string[] origins)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(policyName, policy =>
            {
                if (origins is null || origins.Length == 0 || Array.Exists(origins, x => x == "*"))
                {
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                }
                else
                {
                    policy.WithOrigins(origins)
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                    // Si vas a usar credenciales (cookies), cambia a:
                    // policy.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
                    // y NO uses "*" arriba.
                }
            });
        });
    }
}
