// src/ZooSanMarino.Application/DTOs/FarmInventoryMovementDtos.cs
using System.Text.Json;

namespace ZooSanMarino.Application.DTOs;

public class InventoryEntryRequest
{
    public int? CatalogItemId { get; set; }
    public string? Codigo { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "kg";
    public string? Reference { get; set; }
    public string? Reason { get; set; }
    public JsonDocument? Metadata { get; set; }
}

public class InventoryExitRequest
{
    public int? CatalogItemId { get; set; }
    public string? Codigo { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "kg";
    public string? Reference { get; set; }
    public string? Reason { get; set; }
    public JsonDocument? Metadata { get; set; }
}

public class InventoryTransferRequest
{
    public int ToFarmId { get; set; }
    public int? CatalogItemId { get; set; }
    public string? Codigo { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "kg";
    public string? Reference { get; set; }   // doc traslado
    public string? Reason { get; set; }
    public JsonDocument? Metadata { get; set; }
}

public class InventoryMovementDto
{
    public int Id { get; set; }
    public int FarmId { get; set; }
    public int CatalogItemId { get; set; }
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public decimal Quantity { get; set; }
    public string MovementType { get; set; } = null!;
    public string Unit { get; set; } = "kg";
    public string? Reference { get; set; }
    public string? Reason { get; set; }
    public Guid? TransferGroupId { get; set; }
    public JsonDocument? Metadata { get; set; }
    public string? ResponsibleUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
