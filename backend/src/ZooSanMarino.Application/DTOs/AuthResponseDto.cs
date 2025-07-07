namespace ZooSanMarino.Application.DTOs;

/// <summary>
/// Respuesta con token JWT e información del usuario autenticado.
/// </summary>
public class AuthResponseDto
{
    public Guid   UserId    { get; set; }

    /// <summary>Nombre de usuario</summary>
    public string Username  { get; set; } = null!;

    /// <summary>Nombre completo</summary>
    public string FullName  { get; set; } = null!;

    /// <summary>Token JWT generado</summary>
    public string Token     { get; set; } = null!;

    /// <summary>Lista de roles del usuario</summary>
    public List<string> Roles { get; set; } = new();

    /// <summary>Lista de empresas asociadas</summary>
    public List<string> Empresas { get; set; } = new();

    /// <summary>Lista de permisos asignados por los roles</summary>
    public List<string> Permisos { get; set; } = new();
}

// Este DTO es la respuesta que se envía al cliente después de un login exitoso
// Contiene el token JWT, el nombre de usuario, el nombre completo del usuario,
// los roles asignados, los permisos y las empresas a las que pertenece el usuario.
// Se utiliza para autenticar al usuario en futuras solicitudes y para mostrar información relevante en la UI
// El token JWT se utiliza para autenticar al usuario en futuras solicitudes
// Los roles y permisos se utilizan para controlar el acceso a diferentes funcionalidades de la aplicación
// Las empresas se utilizan para mostrar información relevante en la UI y para controlar el acceso a diferentes
// funcionalidades de la aplicación según la empresa a la que pertenece el usuario
// El UserId se utiliza para identificar al usuario de manera única en la base de datos
// El FullName se utiliza para mostrar el nombre completo del usuario en la UI
// El Username se utiliza para mostrar el nombre de usuario en la UI