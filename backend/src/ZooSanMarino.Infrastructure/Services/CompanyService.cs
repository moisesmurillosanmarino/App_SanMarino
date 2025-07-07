using Microsoft.EntityFrameworkCore;
using ZooSanMarino.Application.DTOs;
using ZooSanMarino.Application.Interfaces;
using ZooSanMarino.Domain.Entities;
using ZooSanMarino.Infrastructure.Persistence;

namespace ZooSanMarino.Infrastructure.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ZooSanMarinoContext _ctx;
        public CompanyService(ZooSanMarinoContext ctx) => _ctx = ctx;

        public async Task<IEnumerable<CompanyDto>> GetAllAsync() =>
            await _ctx.Companies
                .Select(c => new CompanyDto(
                    c.Id,
                    c.Name,
                    c.Identifier,      // número de documento
                    c.DocumentType,    // tipo de documento
                    c.Address,
                    c.Phone,
                    c.Email,
                    c.Country,
                    c.State,
                    c.City,
                    c.VisualPermissions,
                    c.MobileAccess
                ))
                .ToListAsync();

        public async Task<CompanyDto?> GetByIdAsync(int id) =>
            await _ctx.Companies
                .Where(c => c.Id == id)
                .Select(c => new CompanyDto(
                    c.Id,
                    c.Name,
                    c.Identifier,
                    c.DocumentType,
                    c.Address,
                    c.Phone,
                    c.Email,
                    c.Country,
                    c.State,
                    c.City,
                    c.VisualPermissions,
                    c.MobileAccess
                ))
                .SingleOrDefaultAsync();

        public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
        {
            var c = new Company
            {
                Name              = dto.Name,
                Identifier        = dto.Identifier,
                DocumentType      = dto.DocumentType,
                Address           = dto.Address,
                Phone             = dto.Phone,
                Email             = dto.Email,
                Country           = dto.Country,
                State             = dto.State,
                City              = dto.City,
                VisualPermissions = dto.VisualPermissions,
                MobileAccess      = dto.MobileAccess
            };
            _ctx.Companies.Add(c);
            await _ctx.SaveChangesAsync();
            var result = await GetByIdAsync(c.Id);
            if (result is null)
                throw new InvalidOperationException("Created company could not be retrieved.");
            return result;
        }

        public async Task<CompanyDto?> UpdateAsync(UpdateCompanyDto dto)
        {
            var c = await _ctx.Companies.FindAsync(dto.Id);
            if (c is null) return null;

            c.Name              = dto.Name;
            c.Identifier        = dto.Identifier;
            c.DocumentType      = dto.DocumentType;
            c.Address           = dto.Address;
            c.Phone             = dto.Phone;
            c.Email             = dto.Email;
            c.Country           = dto.Country;
            c.State             = dto.State;
            c.City              = dto.City;
            c.VisualPermissions = dto.VisualPermissions;
            c.MobileAccess      = dto.MobileAccess;

            await _ctx.SaveChangesAsync();
            return await GetByIdAsync(c.Id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var c = await _ctx.Companies.FindAsync(id);
            if (c is null) return false;
            _ctx.Companies.Remove(c);
            await _ctx.SaveChangesAsync();
            return true;
        }
    }
}
