using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPesoInicialMAndHToLoteReproductora : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "peso_inicial",
                table: "lote_reproductoras",
                newName: "peso_inicial_m");

            migrationBuilder.RenameColumn(
                name: "peso_final",
                table: "lote_reproductoras",
                newName: "peso_inicial_h");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "peso_inicial_m",
                table: "lote_reproductoras",
                newName: "peso_inicial");

            migrationBuilder.RenameColumn(
                name: "peso_inicial_h",
                table: "lote_reproductoras",
                newName: "peso_final");
        }
    }
}
