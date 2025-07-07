public record LoteReproductoraDto(
    string   LoteId,
    string   ReproductoraId,
    string   NombreLote,
    DateTime? FechaEncasetamiento,
    int?     M,
    int?     H,
    int?     MortCajaH,
    int?     MortCajaM,
    int?     UnifH,
    int?     UnifM,
    decimal? PesoInicialM,
    decimal? PesoInicialH
);

public record CreateLoteReproductoraDto(
    string   LoteId,
    string   ReproductoraId,
    string   NombreLote,
    DateTime? FechaEncasetamiento,
    int?     M,
    int?     H,
    int?     MortCajaH,
    int?     MortCajaM,
    int?     UnifH,
    int?     UnifM,
    decimal? PesoInicialM,
    decimal? PesoInicialH
);

public record UpdateLoteReproductoraDto(
    string   LoteId,
    string   ReproductoraId,
    string   NombreLote,
    DateTime? FechaEncasetamiento,
    int?     M,
    int?     H,
    int?     MortCajaH,
    int?     MortCajaM,
    int?     UnifH,
    int?     UnifM,
    decimal? PesoInicialM,
    decimal? PesoInicialH
);
