using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposLevante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "total_aves_macho",
                table: "lotes",
                newName: "nucleo_id");

            migrationBuilder.RenameColumn(
                name: "total_aves_hembra",
                table: "lotes",
                newName: "mort_caja_m");

            migrationBuilder.RenameColumn(
                name: "fecha_llegada",
                table: "lotes",
                newName: "fecha_encaset");

            migrationBuilder.RenameColumn(
                name: "fase",
                table: "lotes",
                newName: "tipo_linea");

            migrationBuilder.AddColumn<int>(
                name: "galpon_id",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "hembras_l",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "machos_l",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mort_caja_h",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "peso_inicial_h",
                table: "lotes",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "peso_inicial_m",
                table: "lotes",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "regional",
                table: "lotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "unif_h",
                table: "lotes",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "unif_m",
                table: "lotes",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "galpon_id",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "hembras_l",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "machos_l",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "mort_caja_h",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "peso_inicial_h",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "peso_inicial_m",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "regional",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "unif_h",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "unif_m",
                table: "lotes");

            migrationBuilder.RenameColumn(
                name: "tipo_linea",
                table: "lotes",
                newName: "fase");

            migrationBuilder.RenameColumn(
                name: "nucleo_id",
                table: "lotes",
                newName: "total_aves_macho");

            migrationBuilder.RenameColumn(
                name: "mort_caja_m",
                table: "lotes",
                newName: "total_aves_hembra");

            migrationBuilder.RenameColumn(
                name: "fecha_encaset",
                table: "lotes",
                newName: "fecha_llegada");
        }
    }
}
