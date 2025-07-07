using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces
{
    public interface IProduccionLoteService
    {
        Task<ProduccionLoteDto> CreateAsync(CreateProduccionLoteDto dto);
        Task<IEnumerable<ProduccionLoteDto>> GetAllAsync();
        Task<ProduccionLoteDto?> GetByLoteIdAsync(string loteId);
        Task<ProduccionLoteDto?> UpdateAsync(UpdateProduccionLoteDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ProduccionLoteDto>> FilterAsync(FilterProduccionLoteDto filter);
}
}