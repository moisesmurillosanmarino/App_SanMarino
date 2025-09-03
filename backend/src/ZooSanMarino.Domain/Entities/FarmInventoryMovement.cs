// src/ZooSanMarino.Domain/Entities/FarmInventoryMovement.cs
using System.Text.Json;
using ZooSanMarino.Domain.Enums;

namespace ZooSanMarino.Domain.Entities;

public class FarmInventoryMovement
{
    public int Id { get; set; }
    public int FarmId { get; set; }
    public int CatalogItemId { get; set; }
    public decimal Quantity { get; set; }      // positiva
    public InventoryMovementType MovementType { get; set; }
    public string Unit { get; set; } = "kg";
    public string? Reference { get; set; }
    public string? Reason { get; set; }
    public Guid? TransferGroupId { get; set; }
    public JsonDocument Metadata { get; set; } = JsonDocument.Parse("{}");
    public string? ResponsibleUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Farm Farm { get; set; } = null!;
    public CatalogItem CatalogItem { get; set; } = null!;
}
