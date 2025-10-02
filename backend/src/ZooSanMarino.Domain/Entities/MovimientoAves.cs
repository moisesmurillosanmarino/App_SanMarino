// src/ZooSanMarino.Domain/Entities/MovimientoAves.cs
namespace ZooSanMarino.Domain.Entities;

/// <summary>
/// Representa un movimiento o traslado de aves entre ubicaciones
/// </summary>
public class MovimientoAves : AuditableEntity
{
    public int Id { get; set; }
    
    // Información del movimiento
    public string NumeroMovimiento { get; set; } = null!; // Número único del movimiento
    public DateTime FechaMovimiento { get; set; }
    public string TipoMovimiento { get; set; } = null!; // Traslado, Ajuste, Liquidacion
    
    // Origen del movimiento
    public int? InventarioOrigenId { get; set; }
    public string? LoteOrigenId { get; set; }
    public int? GranjaOrigenId { get; set; }
    public string? NucleoOrigenId { get; set; }
    public string? GalponOrigenId { get; set; }
    
    // Destino del movimiento
    public int? InventarioDestinoId { get; set; }
    public string? LoteDestinoId { get; set; }
    public int? GranjaDestinoId { get; set; }
    public string? NucleoDestinoId { get; set; }
    public string? GalponDestinoId { get; set; }
    
    // Cantidades movidas
    public int CantidadHembras { get; set; }
    public int CantidadMachos { get; set; }
    public int CantidadMixtas { get; set; }
    
    // Información adicional
    public string? MotivoMovimiento { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "Pendiente"; // Pendiente, Completado, Cancelado
    
    // Usuario que realizó el movimiento
    public int UsuarioMovimientoId { get; set; }
    public string? UsuarioNombre { get; set; }
    
    // Fechas de procesamiento
    public DateTime? FechaProcesamiento { get; set; }
    public DateTime? FechaCancelacion { get; set; }
    
    // Propiedades calculadas
    public int TotalAves => CantidadHembras + CantidadMachos + CantidadMixtas;
    
    // Navegación
    public InventarioAves? InventarioOrigen { get; set; }
    public InventarioAves? InventarioDestino { get; set; }
    public Lote? LoteOrigen { get; set; }
    public Lote? LoteDestino { get; set; }
    public Farm? GranjaOrigen { get; set; }
    public Farm? GranjaDestino { get; set; }
    public Nucleo? NucleoOrigen { get; set; }
    public Nucleo? NucleoDestino { get; set; }
    public Galpon? GalponOrigen { get; set; }
    public Galpon? GalponDestino { get; set; }
    
    // Métodos de dominio
    public bool EsMovimientoValido()
    {
        return TotalAves > 0 && 
               (InventarioOrigenId.HasValue || LoteOrigenId != null) &&
               (InventarioDestinoId.HasValue || LoteDestinoId != null) &&
               Estado == "Pendiente";
    }
    
    public void Procesar()
    {
        if (!EsMovimientoValido())
            throw new InvalidOperationException("El movimiento no es válido para procesar");
            
        Estado = "Completado";
        FechaProcesamiento = DateTime.UtcNow;
    }
    
    public void Cancelar(string motivo)
    {
        if (Estado == "Completado")
            throw new InvalidOperationException("No se puede cancelar un movimiento ya completado");
            
        Estado = "Cancelado";
        FechaCancelacion = DateTime.UtcNow;
        Observaciones = $"{Observaciones} | Cancelado: {motivo}";
    }
    
    public string GenerarNumeroMovimiento()
    {
        return $"MOV-{DateTime.UtcNow:yyyyMMdd}-{Id:D6}";
    }
    
    public bool EsMovimientoInterno()
    {
        return GranjaOrigenId == GranjaDestinoId;
    }
    
    public bool EsMovimientoEntreGranjas()
    {
        return GranjaOrigenId != GranjaDestinoId;
    }
}
