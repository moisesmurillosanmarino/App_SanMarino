using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "produccion_diaria",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    lote_id = table.Column<string>(type: "text", nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    mortalidad_hembras = table.Column<int>(type: "integer", nullable: false),
                    mortalidad_machos = table.Column<int>(type: "integer", nullable: false),
                    sel_h = table.Column<int>(type: "integer", nullable: false),
                    cons_kg_h = table.Column<double>(type: "double precision", nullable: false),
                    cons_kg_m = table.Column<double>(type: "double precision", nullable: false),
                    huevo_tot = table.Column<int>(type: "integer", nullable: false),
                    huevo_inc = table.Column<int>(type: "integer", nullable: false),
                    tipo_alimento = table.Column<string>(type: "text", nullable: false),
                    observaciones = table.Column<string>(type: "text", nullable: true),
                    peso_huevo = table.Column<double>(type: "double precision", nullable: true),
                    etapa = table.Column<int>(type: "integer", nullable: false),
                    lote_produccion_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_produccion_diaria", x => x.id);
                    table.ForeignKey(
                        name: "fk_produccion_diaria_produccion_lotes_lote_produccion_id",
                        column: x => x.lote_produccion_id,
                        principalTable: "produccion_lotes",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_produccion_diaria_lote_produccion_id",
                table: "produccion_diaria",
                column: "lote_produccion_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "produccion_diaria");
        }
    }
}
