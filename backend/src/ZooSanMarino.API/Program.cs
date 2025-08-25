using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using EFCore.NamingConventions;
using System.Text;

using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Services;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.API.Extensions;          // MigrateAndSeedAsync
using ZooSanMarino.Application.Options;     // JwtOptions

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────
// Puerto
// ─────────────────────────────────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "5002";
builder.WebHost.UseUrls($"http://+:{port}");

// ─────────────────────────────────────
// Conexión a BD
// ─────────────────────────────────────
var conn = Environment.GetEnvironmentVariable("ZOO_CONN")
          ?? builder.Configuration.GetConnectionString("ZooSanMarinoContext");

if (string.IsNullOrWhiteSpace(conn))
    throw new InvalidOperationException("Connection string no configurada (ZOO_CONN o ConnectionStrings:ZooSanMarinoContext).");

// ─────────────────────────────────────
// JWT: appsettings + .env
// ─────────────────────────────────────
var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtOptions>() ?? new JwtOptions();

string? envKey      = Environment.GetEnvironmentVariable("JWT_KEY");
string? envIssuer   = Environment.GetEnvironmentVariable("JWT_ISSUER");
string? envAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
string? envDuration = Environment.GetEnvironmentVariable("JWT_DURATION");

if (!string.IsNullOrWhiteSpace(envKey))      jwt.Key = envKey;
if (!string.IsNullOrWhiteSpace(envIssuer))   jwt.Issuer = envIssuer;
if (!string.IsNullOrWhiteSpace(envAudience)) jwt.Audience = envAudience;
if (int.TryParse(envDuration, out var dur))  jwt.DurationInMinutes = dur;

jwt.EnsureValid();
builder.Services.AddSingleton(jwt);

// ─────────────────────────────────────
// CORS (desde AllowedOrigins en appsettings)
// ─────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
// CORS totalmente abierto (DEV ONLY)
builder.Services.AddCors(o =>
{
    o.AddPolicy("AppCors", p =>
    {
        p.SetIsOriginAllowed(_ => true)  // acepta cualquier Origin
         .AllowAnyHeader()                // acepta cualquier header
         .AllowAnyMethod();               // acepta cualquier método
        // NO usar .AllowCredentials() con "cualquier origin"
    });
});


// ─────────────────────────────────────
// DbContext
// ─────────────────────────────────────
builder.Services.AddDbContext<ZooSanMarinoContext>(opts =>
    opts.UseSnakeCaseNamingConvention()
        .UseNpgsql(conn)
);

// ─────────────────────────────────────
// Identity Hasher
// ─────────────────────────────────────
builder.Services.AddScoped<IPasswordHasher<Login>, PasswordHasher<Login>>();

// ─────────────────────────────────────
// Servicios (Application Layer)
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
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<ICatalogItemService, CatalogItemService>();

// Health checks (opcional)
builder.Services.AddHealthChecks();

// ─────────────────────────────────────
// Auth (JWT) — ignora preflight OPTIONS
// ─────────────────────────────────────
var keyBytes = Encoding.UTF8.GetBytes(jwt.Key);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime         = true,

            ValidIssuer      = jwt.Issuer,
            ValidAudience    = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew        = TimeSpan.Zero
        };

        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (HttpMethods.IsOptions(ctx.Request.Method))
                    ctx.NoResult(); // no intentes autenticar un preflight
                return Task.CompletedTask;
            }
        };
    });

// ─────────────────────────────────────
// Authorization (policies por permiso)
// ─────────────────────────────────────
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("CanManageUsers", p => p.RequireClaim("permission", "manage_users"));
    opt.AddPolicy("CanManageMenus", p => p.RequireClaim("permission", "manage_menus"));
    opt.AddPolicy("CanManageRoles", p => p.RequireClaim("permission", "manage_roles"));
});

// ─────────────────────────────────────
// Swagger + Bearer
// ─────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ZooSanMarino", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Description  = "JWT Bearer: pega SOLO el token (Swagger añadirá 'Bearer ').",
        In           = ParameterLocation.Header,
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        Reference    = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id   = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// ─────────────────────────────────────
// Controllers
// ─────────────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

// ─────────────────────────────────────
// Pipeline (orden importa)
// ─────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    c.DisplayRequestDuration();
});

// Necesario para que CORS intercepte preflight con endpoint routing
app.UseRouting();

// CORS SIEMPRE antes de Auth/Authorization
app.UseCors("AppCors");

app.UseAuthentication();
app.UseAuthorization();

// Health endpoints
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapHealthChecks("/hc");

// (Defensivo) Catch-all para OPTIONS si algo se adelanta
app.MapMethods("{*path}", new[] { "OPTIONS" }, () => Results.Ok())
   .RequireCors("AppCors");

// Migrar + Seed (idempotente)
await app.MigrateAndSeedAsync();

// Controllers
app.MapControllers();

app.Run();
