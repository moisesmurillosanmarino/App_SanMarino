using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using EFCore.NamingConventions;
using ZooSanMarino.Infrastructure.Persistence;
using ZooSanMarino.Infrastructure.Services;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────
// CORS
// ─────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
          .AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader();
    });
});

// ─────────────────────────────
// DBContext
// ─────────────────────────────
var conn = builder.Configuration.GetConnectionString("ZooSanMarinoContext");
builder.Services.AddDbContext<ZooSanMarinoContext>(opts =>
    opts.UseSnakeCaseNamingConvention()
        .UseNpgsql(conn)
);

// ─────────────────────────────
// Identity Hasher para Login
// ─────────────────────────────
builder.Services.AddScoped<IPasswordHasher<Login>, PasswordHasher<Login>>();

// ─────────────────────────────
// Inyección de servicios (Application Layer)
// ─────────────────────────────
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

// ─────────────────────────────
// JWT Authentication
// ─────────────────────────────
var jwt = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwt["Key"]!);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(opts =>
       {
           opts.TokenValidationParameters = new TokenValidationParameters
           {
               ValidateIssuer = true,
               ValidateAudience = true,
               ValidateIssuerSigningKey = true,
               ValidIssuer = jwt["Issuer"],
               ValidAudience = jwt["Audience"],
               IssuerSigningKey = new SymmetricSecurityKey(key),
               ClockSkew = TimeSpan.Zero
           };
       });

// ─────────────────────────────
// Swagger (con soporte Bearer Token)
// ─────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ZooSanMarino", Version = "v1" });

    var sec = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese: Bearer {token}"
    };

    c.AddSecurityDefinition("Bearer", sec);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [sec] = new[] { "Bearer" } });
});

// ─────────────────────────────
// Controllers y Middleware
// ─────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1"));

app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

// Migración automática al iniciar
using var scope = app.Services.CreateScope();
scope.ServiceProvider.GetRequiredService<ZooSanMarinoContext>().Database.Migrate();

app.MapControllers();
app.Run();
