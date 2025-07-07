// src/ZooSanMarino.API/Controllers/FarmController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class FarmController : ControllerBase
{
    private readonly IFarmService _svc;
    public FarmController(IFarmService svc) => _svc = svc;

    [HttpGet]       public async Task<IActionResult> GetAll()    => Ok(await _svc.GetAllAsync());
    [HttpGet("{id}")] public async Task<IActionResult> GetById(int id) =>
        (await _svc.GetByIdAsync(id)) is FarmDto dto ? Ok(dto) : NotFound();

    [HttpPost] public async Task<IActionResult> Create(CreateFarmDto dto)
    {
        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")] public async Task<IActionResult> Update(int id, UpdateFarmDto dto)
    {
        if (id != dto.Id) return BadRequest();
        return (await _svc.UpdateAsync(dto)) is FarmDto upd
            ? Ok(upd)
            : NotFound();
    }

    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) =>
        (await _svc.DeleteAsync(id)) ? NoContent() : NotFound();
}
