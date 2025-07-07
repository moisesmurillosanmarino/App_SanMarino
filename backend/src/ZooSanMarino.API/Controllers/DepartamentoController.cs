// ZooSanMarino.API/Controllers/DepartamentoController.cs
using Microsoft.AspNetCore.Mvc;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;

namespace ZooSanMarino.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DepartamentoController : ControllerBase
{
    private readonly IDepartamentoService _svc;
    public DepartamentoController(IDepartamentoService svc)
        => _svc = svc;

    // GET api/Departamento
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _svc.GetAllAsync());

    // GET api/Departamento/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => (await _svc.GetByIdAsync(id)) is DepartamentoDto dto
            ? Ok(dto)
            : NotFound();

    // POST api/Departamento
    [HttpPost]
    public async Task<IActionResult> Create(CreateDepartamentoDto dto)
        => CreatedAtAction(nameof(GetById),
             new { id = (await _svc.CreateAsync(dto)).DepartamentoId },
             dto);

    // PUT api/Departamento/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateDepartamentoDto dto)
    {
        if (id != dto.DepartamentoId) return BadRequest();
        return await _svc.UpdateAsync(dto)
            ? NoContent()
            : NotFound();
    }

    // DELETE api/Departamento/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id)
            ? NoContent()
            : NotFound();
}
