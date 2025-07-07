using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendLoteTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ano_tabla_genetica",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "codigo_guia_genetica",
                table: "lotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "linea",
                table: "lotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "raza",
                table: "lotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tecnico",
                table: "lotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mort_caja_h",
                table: "lote_reproductoras",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mort_caja_m",
                table: "lote_reproductoras",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "peso_final",
                table: "lote_reproductoras",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "peso_inicial",
                table: "lote_reproductoras",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "unif_h",
                table: "lote_reproductoras",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "unif_m",
                table: "lote_reproductoras",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ano_tabla_genetica",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "codigo_guia_genetica",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "linea",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "raza",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "tecnico",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "mort_caja_h",
                table: "lote_reproductoras");

            migrationBuilder.DropColumn(
                name: "mort_caja_m",
                table: "lote_reproductoras");

            migrationBuilder.DropColumn(
                name: "peso_final",
                table: "lote_reproductoras");

            migrationBuilder.DropColumn(
                name: "peso_inicial",
                table: "lote_reproductoras");

            migrationBuilder.DropColumn(
                name: "unif_h",
                table: "lote_reproductoras");

            migrationBuilder.DropColumn(
                name: "unif_m",
                table: "lote_reproductoras");
        }
    }
}
