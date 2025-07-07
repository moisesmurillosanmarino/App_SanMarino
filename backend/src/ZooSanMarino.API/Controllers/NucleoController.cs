// src/ZooSanMarino.API/Controllers/NucleoController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NucleoController : ControllerBase
{
    readonly INucleoService _svc;
    public NucleoController(INucleoService svc) => _svc = svc;

    [HttpGet] public async Task<IActionResult> GetAll() =>
      Ok(await _svc.GetAllAsync());

    [HttpGet("{nucleoId}/{granjaId}")] 
    public async Task<IActionResult> GetById(string nucleoId, int granjaId) =>
      (await _svc.GetByIdAsync(nucleoId, granjaId)) is NucleoDto dto
        ? Ok(dto)
        : NotFound();

    [HttpPost] public async Task<IActionResult> Create(CreateNucleoDto dto)
    {
        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById),
          new { nucleoId = created.NucleoId, granjaId = created.GranjaId },
          created);
    }

    [HttpPut("{nucleoId}/{granjaId}")]
    public async Task<IActionResult> Update(string nucleoId, int granjaId, UpdateNucleoDto dto)
    {
        if (dto.NucleoId != nucleoId || dto.GranjaId != granjaId)
            return BadRequest();

        return (await _svc.UpdateAsync(dto)) is NucleoDto upd
          ? Ok(upd)
          : NotFound();
    }

    [HttpDelete("{nucleoId}/{granjaId}")]
    public async Task<IActionResult> Delete(string nucleoId, int granjaId) =>
      await _svc.DeleteAsync(nucleoId, granjaId)
        ? NoContent()
        : NotFound();
}
