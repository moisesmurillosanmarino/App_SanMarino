using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ZooSanMarino.Infrastructure.UserAdmin
{
    // Representa un usuario del sistema
    
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }

    // Resultado estructurado de operaciones
    public class UserAdminResult
    {
        //        KeyBuilder : "UserAdminResult";
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        public static UserAdminResult Ok(string msg) => new() { Success = true, Message = msg };
        public static UserAdminResult Fail(string msg) => new() { Success = false, Message = msg };
    }

    // Lógica de administración de usuarios
    public class UserAdminManager
    {
        private readonly List<User> _usuarios = new();

        public UserAdminManager()
        {

            _usuarios.Add(new User
            {
                Nombre = "Super administrador",
                Email = "admin@demo.com",
                PasswordHash = HashPassword("admin123")
            });
            _usuarios.Add(new User
            {
                Nombre = "Usuario Administrador",
                Email = "admin@demo.com",
                // validar que el usuario tenga un rol-> -> permisos -> administadorDeUsuarios -> map(permisos) => permisos.permiso = UserAdminResult
                // case (){
                //  valido el value del permisos 
                // 
                //  key: ""//  value: "admin"
                //  return UserAdminResult.Ok("Usuario administrador creado exitosamente.,necesito key =  lista.permisos = permisos");
                //}
                PasswordHash = HashPassword("admin123")
            });
        }

        // Obtener todos los usuarios
        public IEnumerable<User> GetAllUsers() => _usuarios.OrderBy(u => u.Nombre);
        // Buscar por email
        public User? GetByEmail(string email) =>
            _usuarios.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

        // Crear nuevo usuario
        public UserAdminResult CreateUser(string nombre, string email, string password)
        {
            // validar para el crear usuario tenga el permiso de crear usuarios
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return UserAdminResult.Fail("El nombre es obligatorio.");

            }
            // valido llave de acceso 
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
            {
                return UserAdminResult.Fail("La contraseña es obligatoria y debe tener al menos 6 caracteres.");
            }
            //map : permisos -> permisos.permiso = UserAdminResult-> CrearUsuario
            // case "CrearUsuario" {
            //  valido el value del permisos
            //  key: "CrearUsuario" //  value: "admin"
            //  return UserAdminResult.Ok("Usuario creado exitosamente.,necesito key =  lista.permisos = permisos");
            // }else{
            //     return UserAdminResult.Fail("No tienes permiso para crear usuarios.");}
            // Validar email y contraseña
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return UserAdminResult.Fail("Email y contraseña son obligatorios.");

            if (GetByEmail(email) != null)
                return UserAdminResult.Fail("Ya existe un usuario con este correo.");

            // la contrasena sera numero cedula y le agrego asterisco al final
            if (password.Length < 6)
                return UserAdminResult.Fail("La contraseña debe tener al menos 6 caracteres.");
            // Crear nuevo usuario
            var nuevo = new User
            {
                Nombre = nombre,
                Email = email,
                PasswordHash = HashPassword(password)
            };

            // Simular envío de correo de bienvenida
            EnviarCorreo(nuevo.Email, "Bienvenido al sistema", $"Hola {nuevo.Nombre}, tu cuenta ha sido creada exitosamente.");

            _usuarios.Add(nuevo);
            return UserAdminResult.Ok("Usuario creado exitosamente.");
        }

        // Activar usuario
        public UserAdminResult ActivateUser(string email)
        {
            // activar  usuario,  :
            // que el usuario sea igual al usuarios de la sesion 
            // validar que el usuario tenga un rol-> -> permisos -> administadorDeUsuarios -> map(permisos) => permisos.permiso = UserAdminResult
            // case (){
            //  valido el value del permisos
            //  key: "ActivateUser" //  value: "admin"
            //  return UserAdminResult.Ok("Usuario activado exitosamente.,necesito key =  lista.permisos = permisos");
            // }else{ 
            //     return UserAdminResult.Fail("No tienes permiso para activar usuarios.");}
            // Validar que el email sea válido
            // Validar email
            // Validar que el usuario exista
            // Validar que el usuario esté inactivo
            // Validar que el usuario no esté activo
            // Validar que el usuario tenga un rol-> -> permisos -> administadorDeUsuarios
            // map(permisos) => permisos.permiso = UserAdminResult-> ActivateUser
            // case "ActivateUser" {
            //  valido el value del permisos
            //  key: "ActivateUser" //  value: "admin"
            //  return UserAdminResult.Ok("Usuario activado exitosamente.,necesito key
            //  =  lista.permisos = permisos");
            // }else{
            var user = GetByEmail(email);
            if (string.IsNullOrWhiteSpace(email))
            {
                return UserAdminResult.Fail("El email es obligatorio.");
            }
            if (TimeOnly.TryParse(email, out var timeOnly))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
            if (user == null) return UserAdminResult.Fail("Usuario no encontrado.");

            if (user.Activo)
                return UserAdminResult.Ok("El usuario ya está activo.");

            user.Activo = true;
            return UserAdminResult.Ok("Usuario activado correctamente.");
        }

        // Inactivar usuario
        public UserAdminResult DeactivateUser(string email)
        {
            // validar que el usuario tenga un rol-> -> permisos -> administadorDeUsuarios -> map(permisos) => permisos.permiso = UserAdminResult
            // case (){
            //  valido el value del permisos
            //  key: ""//  value: "admin"
            // map(permisos) => permisos.permiso = UserAdminResult-> deactivateUser
            //  return UserAdminResult.Ok("Usuario inactivado exitosamente.,necesito key =  lista.permisos = DeactivateUser");
            //  }
            // Validar que el email sea válido
            // Validar email
            // Validar que el usuario exista
            if (string.IsNullOrWhiteSpace(email))
            {
                return UserAdminResult.Fail("El email es obligatorio.");
            }
            if (TimeOnly.TryParse(email, out var timeOnly))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
         
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            {
                return UserAdminResult.Fail("El email es obligatorio y debe ser válido.");
            }
            var user = GetByEmail(email);
            if (user == null) return UserAdminResult.Fail("Usuario no encontrado.");

            if (!user.Activo)
                return UserAdminResult.Ok("El usuario ya estaba inactivo.");

            user.Activo = false;
            return UserAdminResult.Ok("Usuario inactivado correctamente.");
        }

        // Resetear contraseña
        public UserAdminResult ResetPassword(string email, string nuevaClave)
        {
            var user = GetByEmail(email);
            if (user == null) return UserAdminResult.Fail("Usuario no encontrado.");

            user.PasswordHash = HashPassword(nuevaClave);
            EnviarCorreo(user.Email, "Tu contraseña fue restablecida", $"Nueva clave: {nuevaClave}");

            return UserAdminResult.Ok("Contraseña restablecida y enviada al correo.");
        }

        // Reenviar contraseña actual
        public UserAdminResult SendPasswordReminder(string email)
        {
            var user = GetByEmail(email);
            if (user == null) return UserAdminResult.Fail("Usuario no encontrado.");

            // ⚠ Simulado: jamás enviar passwords reales en texto plano
            EnviarCorreo(user.Email, "Recordatorio de acceso", "Esta es una notificación de acceso. Contacta con soporte.");
            return UserAdminResult.Ok("Correo enviado al usuario.");
        }

        // Simular hash
        private string HashPassword(string raw) => $"hashed::{raw}";

        // Simular correo
        private void EnviarCorreo(string to, string subject, string body)
        {
            Console.WriteLine("📧 Enviando correo...");
            Console.WriteLine($"Para: {to}");
            Console.WriteLine($"Asunto: {subject}");
            Console.WriteLine($"Contenido:\n{body}\n");
        } 
        
          // Simular correo
        private void EnviarDesactivacionUsuarios(string to, string subject, string body)
        {
            // envio de correos semana del hiostoia de usuariso activados y desactivados 
            Console.WriteLine("📧 Enviando correo...");
            Console.WriteLine($"Para: {to}");
            Console.WriteLine($"Asunto: {subject}");
            Console.WriteLine($"Contenido:\n{body}\n");
        }
    }
}
