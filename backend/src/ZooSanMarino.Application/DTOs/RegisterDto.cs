// ZooSanMarino.Application/DTOs/RegisterDto.cs
namespace ZooSanMarino.Application.DTOs;

/// <summary>
/// DTO para registrar un nuevo usuario junto a su login.
/// </summary>
public class RegisterDto
{
    // Datos de Login
    public string Email     { get; set; } = null!;
    public string Password  { get; set; } = null!;

    // Datos del Usuario
    public string SurName   { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string Cedula    { get; set; } = null!;
    public string Telefono  { get; set; } = null!;
    public string Ubicacion { get; set; } = null!;

    // Asignación multiempresa y roles
    public int[] CompanyIds { get; set; } = Array.Empty<int>();
    public int[]? RoleIds   { get; set; }
}
