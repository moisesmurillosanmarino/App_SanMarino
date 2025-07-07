using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChangesToLote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "aves_encasetadas",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "edad_inicial",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mixtas",
                table: "lotes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "peso_mixto",
                table: "lotes",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "aves_encasetadas",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "edad_inicial",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "mixtas",
                table: "lotes");

            migrationBuilder.DropColumn(
                name: "peso_mixto",
                table: "lotes");
        }
    }
}
