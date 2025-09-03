// src/ZooSanMarino.Application/Interfaces/IFarmInventoryMovementService.cs
using ZooSanMarino.Application.DTOs;

namespace ZooSanMarino.Application.Interfaces;

public interface IFarmInventoryMovementService
{
    Task<InventoryMovementDto> PostEntryAsync(int farmId, InventoryEntryRequest req, CancellationToken ct = default);
    Task<InventoryMovementDto> PostExitAsync(int farmId, InventoryExitRequest req, CancellationToken ct = default);
    Task<(InventoryMovementDto Out, InventoryMovementDto In)> PostTransferAsync(int fromFarmId, InventoryTransferRequest req, CancellationToken ct = default);
}
