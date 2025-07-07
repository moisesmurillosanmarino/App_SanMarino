// src/ZooSanMarino.API/Controllers/LoteSeguimientoController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoteSeguimientoController : ControllerBase
{
    private readonly ILoteSeguimientoService _svc;
    public LoteSeguimientoController(ILoteSeguimientoService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _svc.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) =>
        (await _svc.GetByIdAsync(id)) is LoteSeguimientoDto dto
          ? Ok(dto)
          : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(CreateLoteSeguimientoDto dto)
    {
        var cr = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = cr.Id }, cr);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateLoteSeguimientoDto dto)
    {
        if (dto.Id != id) return BadRequest();
        return (await _svc.UpdateAsync(dto)) is LoteSeguimientoDto upd
          ? Ok(upd)
          : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) =>
        (await _svc.DeleteAsync(id)) ? NoContent() : NotFound();
}
