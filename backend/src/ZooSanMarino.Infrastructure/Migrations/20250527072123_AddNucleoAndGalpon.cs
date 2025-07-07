using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNucleoAndGalpon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "nucleos",
                columns: table => new
                {
                    nucleo_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    granja_id = table.Column<int>(type: "integer", nullable: false),
                    nucleo_nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nucleos", x => new { x.nucleo_id, x.granja_id });
                    table.ForeignKey(
                        name: "fk_nucleos_farms_granja_id",
                        column: x => x.granja_id,
                        principalTable: "farms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "galpones",
                columns: table => new
                {
                    galpon_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    galpon_nucleo_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    granja_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_galpones", x => x.galpon_id);
                    table.ForeignKey(
                        name: "fk_galpones_farms_granja_id",
                        column: x => x.granja_id,
                        principalTable: "farms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_galpones_nucleos_galpon_nucleo_id_granja_id",
                        columns: x => new { x.galpon_nucleo_id, x.granja_id },
                        principalTable: "nucleos",
                        principalColumns: new[] { "nucleo_id", "granja_id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_galpones_galpon_nucleo_id_granja_id",
                table: "galpones",
                columns: new[] { "galpon_nucleo_id", "granja_id" });

            migrationBuilder.CreateIndex(
                name: "ix_galpones_granja_id",
                table: "galpones",
                column: "granja_id");

            migrationBuilder.CreateIndex(
                name: "ix_nucleos_granja_id",
                table: "nucleos",
                column: "granja_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "galpones");

            migrationBuilder.DropTable(
                name: "nucleos");
        }
    }
}
