using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixLoteSeguimientoNav : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "lote_seguimientos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reproductora_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    peso_inicial = table.Column<decimal>(type: "numeric", nullable: true),
                    peso_final = table.Column<decimal>(type: "numeric", nullable: true),
                    mortalidad_m = table.Column<int>(type: "integer", nullable: true),
                    mortalidad_h = table.Column<int>(type: "integer", nullable: true),
                    sel_m = table.Column<int>(type: "integer", nullable: true),
                    sel_h = table.Column<int>(type: "integer", nullable: true),
                    error_m = table.Column<int>(type: "integer", nullable: true),
                    error_h = table.Column<int>(type: "integer", nullable: true),
                    tipo_alimento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    consumo_alimento = table.Column<decimal>(type: "numeric", nullable: true),
                    observaciones = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lote_seguimientos", x => x.id);
                    table.ForeignKey(
                        name: "fk_lote_seguimientos_lote_reproductoras_lote_id_reproductora_id",
                        columns: x => new { x.lote_id, x.reproductora_id },
                        principalTable: "lote_reproductoras",
                        principalColumns: new[] { "lote_id", "reproductora_id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_lote_seguimientos_lote_id_reproductora_id",
                table: "lote_seguimientos",
                columns: new[] { "lote_id", "reproductora_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lote_seguimientos");
        }
    }
}
