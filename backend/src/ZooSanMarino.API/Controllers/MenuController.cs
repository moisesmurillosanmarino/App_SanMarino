// src/ZooSanMarino.API/Controllers/MenuController.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _svc;

    public MenuController(IMenuService svc) => _svc = svc;

    /// <summary>
    /// Obtiene el árbol completo de menús (sin filtrar por permisos). Útil para administración.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "CanManageMenus")] // quita esta línea si no usas policies
    [ProducesResponseType(typeof(MenuItemDto[]), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTree() =>
        Ok(await _svc.GetTreeAsync());

    /// <summary>
    /// Obtiene el menú filtrado por los permisos del usuario autenticado.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(MenuItemDto[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetForCurrentUser()
    {
        // intenta claims comunes: NameIdentifier / sub / uid
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? User.FindFirstValue("uid");

        if (!Guid.TryParse(idStr, out var userId))
            return Unauthorized("No se pudo determinar el GUID del usuario.");

        var data = await _svc.GetForUserAsync(userId);
        return Ok(data);
    }

    /// <summary>
    /// Obtiene el menú filtrado por permisos para un usuario específico (administración).
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [Authorize(Policy = "CanManageUsers")] // quita esta línea si no usas policies
    [ProducesResponseType(typeof(MenuItemDto[]), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetForUser(Guid userId) =>
        Ok(await _svc.GetForUserAsync(userId));

    /// <summary>
    /// Crea un ítem de menú (ABM).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "CanManageMenus")]
    [ProducesResponseType(typeof(MenuItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMenuDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetTree), new { id = created.Id }, created);
    }

    /// <summary>
    /// Actualiza un ítem de menú (ABM).
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "CanManageMenus")]
    [ProducesResponseType(typeof(MenuItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMenuDto dto)
    {
        if (id != dto.Id) return BadRequest("El id de la ruta no coincide con el del cuerpo.");
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var upd = await _svc.UpdateAsync(dto);
        return upd is null ? NotFound() : Ok(upd);
    }

    /// <summary>
    /// Elimina un ítem de menú (ABM). No permite eliminar si tiene hijos.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "CanManageMenus")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id) =>
        (await _svc.DeleteAsync(id)) ? NoContent() : NotFound();
}
