// file: src/ZooSanMarino.API/Program.cs
using System.Text;
using EFCore.NamingConventions;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ZooSanMarino.API.Extensions;             // MigrateAndSeedAsync
using ZooSanMarino.API.Infrastructure;         // HttpCurrentUser
using ZooSanMarino.Application.Interfaces;      // ICurrentUser + servicios
using ZooSanMarino.Application.Options;         // JwtOptions
using ZooSanMarino.Application.Validators;      // SeguimientoLoteLevanteDtoValidator
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Providers;    // EfAlimentoNutricionProvider / NullGramajeProvider
using ZooSanMarino.Infrastructure.Services;

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

// Recomendado para Npgsql con timestamps legacy si lo usas
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// ─────────────────────────────────────
// JWT (mezcla appsettings y variables de entorno)
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
// CORS (abrir según necesites)
// ─────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// ─────────────────────────────────────
// DbContext
// ─────────────────────────────────────
builder.Services.AddDbContext<ZooSanMarinoContext>(opts =>
    opts.UseSnakeCaseNamingConvention()
        .UseNpgsql(conn));

// ─────────────────────────────────────
// Identity Hasher
// ─────────────────────────────────────
builder.Services.AddScoped<IPasswordHasher<Login>, PasswordHasher<Login>>();

// ─────────────────────────────────────
// IHttpContextAccessor + ICurrentUser
// ─────────────────────────────────────
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();

// ─────────────────────────────────────
// Servicios de aplicación/infra
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
builder.Services.AddScoped<IFarmInventoryService, FarmInventoryService>();
builder.Services.AddScoped<IFarmInventoryMovementService, FarmInventoryMovementService>();


// Proveedores de nutrición/gramaje
builder.Services.AddScoped<IAlimentoNutricionProvider, EfAlimentoNutricionProvider>();
builder.Services.AddScoped<IGramajeProvider, NullGramajeProvider>(); // cambia a tu provider real cuando esté

// ─────────────────────────────────────
// FluentValidation
// ─────────────────────────────────────
builder.Services.AddValidatorsFromAssemblyContaining<SeguimientoLoteLevanteDtoValidator>();
builder.Services.AddFluentValidationAutoValidation();

// Health checks
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
                    ctx.NoResult(); // no autenticar preflight
                return Task.CompletedTask;
            }
        };
    });

// ─────────────────────────────────────
// Authorization (políticas por permiso)
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
        Reference    = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } });
});

// ─────────────────────────────────────
// Controllers
// ─────────────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

// ─────────────────────────────────────
// Pipeline
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

// Catch-all OPTIONS
app.MapMethods("{*path}", new[] { "OPTIONS" }, () => Results.Ok())
   .RequireCors("AppCors");

// Migrar + Seed
await app.MigrateAndSeedAsync();

// Controllers
app.MapControllers();

app.Run();
