using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProduccionLote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "produccion_lotes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    fecha_inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    hembras_iniciales = table.Column<int>(type: "integer", nullable: false),
                    machos_iniciales = table.Column<int>(type: "integer", nullable: false),
                    huevos_iniciales = table.Column<int>(type: "integer", nullable: false),
                    tipo_nido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    nucleo_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    granja_id = table.Column<int>(type: "integer", nullable: false),
                    ciclo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_produccion_lotes", x => x.id);
                    table.ForeignKey(
                        name: "fk_produccion_lotes_lotes_lote_id",
                        column: x => x.lote_id,
                        principalTable: "lotes",
                        principalColumn: "lote_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_produccion_lotes_nucleos_nucleo_id_granja_id",
                        columns: x => new { x.nucleo_id, x.granja_id },
                        principalTable: "nucleos",
                        principalColumns: new[] { "nucleo_id", "granja_id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_produccion_lotes_lote_id",
                table: "produccion_lotes",
                column: "lote_id");

            migrationBuilder.CreateIndex(
                name: "ix_produccion_lotes_nucleo_id_granja_id",
                table: "produccion_lotes",
                columns: new[] { "nucleo_id", "granja_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "produccion_lotes");
        }
    }
}
