using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IProduccionDiariaService
{
    Task<ProduccionDiariaDto> CreateAsync(CreateProduccionDiariaDto dto);
    Task<IEnumerable<ProduccionDiariaDto>> FilterAsync(FilterProduccionDiariaDto filtro);
    Task<bool> DeleteAsync(int id);
    Task<ProduccionDiariaDto?> UpdateAsync(UpdateProduccionDiariaDto dto);
    Task<ProduccionDiariaLoteDto?> GetByIdAsync(int id);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetAllAsync();
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAsync(string loteId);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAndFechaAsync(string loteId, DateTime fecha);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAndFechaRangeAsync(string loteId, DateTime desde, DateTime hasta);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByFechaAsync(DateTime fecha);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByFechaRangeAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAndEtapaAsync(string loteId, int etapa);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAndEtapaAndFechaAsync(string loteId, int etapa, DateTime fecha);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByLoteIdAndEtapaAndFechaRangeAsync(string loteId, int etapa, DateTime desde, DateTime hasta);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByEtapaAsync(int etapa);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByEtapaAndFechaAsync(int etapa, DateTime fecha);
    Task<IEnumerable<ProduccionDiariaLoteDto>> GetByEtapaAndFechaRangeAsync(int etapa, DateTime desde, DateTime hasta); 
}