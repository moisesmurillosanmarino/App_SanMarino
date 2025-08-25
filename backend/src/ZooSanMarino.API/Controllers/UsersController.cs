// src/ZooSanMarino.API/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IUserService _userService;

    public UsersController(IAuthService auth, IUserService userService)
    {
        _auth = auth;
        _userService = userService;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Crear nuevo usuario (campos obligatorios)
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] RegisterDto dto)
    {
        try
        {
            // Mantén el flujo de registro para garantizar obligatoriedad y consistencia (login + vínculos).
            var result = await _auth.RegisterAsync(dto);
            return Created(string.Empty, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Listado (resumen)
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(List<UserListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get()
    {
        var users = await _userService.GetUsersAsync();
        return Ok(users);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Detalle por ID
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is not null ? Ok(user) : NotFound();
    }

    // ─────────────────────────────────────────────────────────────────────
    // UPDATE completo (PUT) - opcional si quieres exigir objeto "completo"
    // ─────────────────────────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var updated = await _userService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // UDDI genérico (PATCH): manda solo lo que quieras cambiar
    // ─────────────────────────────────────────────────────────────────────
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Patch(Guid id, [FromBody] UpdateUserDto dto)
    {
        // Misma lógica que UpdateAsync, pero semánticamente correcto para "parcial"
        try
        {
            var updated = await _userService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Cambiar contraseña (endpoint dedicado)
    // ─────────────────────────────────────────────────────────────────────
    [HttpPatch("{id:guid}/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
    {
        try
        {
            await _auth.ChangePasswordAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Eliminar usuario en cascada
    // ─────────────────────────────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
