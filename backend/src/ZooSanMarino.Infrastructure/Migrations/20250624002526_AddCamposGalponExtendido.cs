using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposGalponExtendido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ancho",
                table: "galpones",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "galpon_nombre",
                table: "galpones",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "largo",
                table: "galpones",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tipo_galpon",
                table: "galpones",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ancho",
                table: "galpones");

            migrationBuilder.DropColumn(
                name: "galpon_nombre",
                table: "galpones");

            migrationBuilder.DropColumn(
                name: "largo",
                table: "galpones");

            migrationBuilder.DropColumn(
                name: "tipo_galpon",
                table: "galpones");
        }
    }
}
