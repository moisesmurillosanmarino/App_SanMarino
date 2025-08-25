namespace ZooSanMarino.Application.DTOs;

public record LoteReproductoraDto(
    string    LoteId,
    string    ReproductoraId,
    string    NombreLote,
    DateTime? FechaEncasetamiento,
    int?      M,
    int?      H,
    int?      Mixtas,
    int?      MortCajaH,
    int?      MortCajaM,
    int?      UnifH,
    int?      UnifM,
    decimal?  PesoInicialM,
    decimal?  PesoInicialH,
    decimal?  PesoMixto
);

public record CreateLoteReproductoraDto(
    string    LoteId,
    string    ReproductoraId,
    string    NombreLote,
    DateTime? FechaEncasetamiento,
    int?      M,
    int?      H,
    int?      Mixtas,
    int?      MortCajaH,
    int?      MortCajaM,
    int?      UnifH,
    int?      UnifM,
    decimal?  PesoInicialM,
    decimal?  PesoInicialH,
    decimal?  PesoMixto
);

public record UpdateLoteReproductoraDto(
    string    LoteId,
    string    ReproductoraId,
    string    NombreLote,
    DateTime? FechaEncasetamiento,
    int?      M,
    int?      H,
    int?      Mixtas,
    int?      MortCajaH,
    int?      MortCajaM,
    int?      UnifH,
    int?      UnifM,
    decimal?  PesoInicialM,
    decimal?  PesoInicialH,
    decimal?  PesoMixto
);
