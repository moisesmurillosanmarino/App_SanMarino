// src/ZooSanMarino.API/Controllers/GalponController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GalponController : ControllerBase
{
  readonly IGalponService _svc;
  public GalponController(IGalponService svc) => _svc = svc;

  [HttpGet]
  public async Task<IActionResult> GetAll() =>
    Ok(await _svc.GetAllAsync());

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(string id) =>
    (await _svc.GetByIdAsync(id)) is GalponDto dto
      ? Ok(dto)
      : NotFound();

  [HttpPost]
  public async Task<IActionResult> Create(CreateGalponDto dto)
  {
    var created = await _svc.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { id = created.GalponId }, created);
  }

  [HttpPut("{id}")]
  public async Task<IActionResult> Update(string id, UpdateGalponDto dto)
  {
    if (dto.GalponId != id) return BadRequest();
    return (await _svc.UpdateAsync(dto)) is GalponDto upd
      ? Ok(upd)
      : NotFound();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(string id) =>
    await _svc.DeleteAsync(id)
      ? NoContent()
      : NotFound();
        
    [HttpGet("granja/{granjaId}/nucleo/{nucleoId}")]
  public async Task<IActionResult> GetByGranjaAndNucleo(int granjaId, string nucleoId) =>
    Ok(await _svc.GetByGranjaAndNucleoAsync(granjaId, nucleoId));

}
