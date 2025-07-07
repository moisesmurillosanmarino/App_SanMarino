// ZooSanMarino.Application/DTOs/LoginDto.cs
namespace ZooSanMarino.Application.DTOs;

/// <summary>
/// DTO para login del usuario.
/// </summary>
public class LoginDto
{
    /// <summary>Correo electrónico</summary>
    public string Email { get; set; } = null!;

    /// <summary>Contraseña</summary>
    public string Password { get; set; } = null!;

    /// <summary>ID de la empresa desde la cual inicia sesión (opcional)</summary>
    public int? CompanyId { get; set; }
}
