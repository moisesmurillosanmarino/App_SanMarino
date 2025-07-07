using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLoteTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "lotes",
                columns: table => new
                {
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    lote_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    granja_id = table.Column<int>(type: "integer", nullable: false),
                    fecha_llegada = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    total_aves_macho = table.Column<int>(type: "integer", nullable: true),
                    total_aves_hembra = table.Column<int>(type: "integer", nullable: true),
                    fase = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lotes", x => x.lote_id);
                    table.ForeignKey(
                        name: "fk_lotes_farms_granja_id",
                        column: x => x.granja_id,
                        principalTable: "farms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lote_reproductoras",
                columns: table => new
                {
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reproductora_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nombre_lote = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    fecha_encasetamiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    macho = table.Column<int>(type: "integer", nullable: true),
                    hembra = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lote_reproductoras", x => new { x.lote_id, x.reproductora_id });
                    table.ForeignKey(
                        name: "fk_lote_reproductoras_lotes_lote_id",
                        column: x => x.lote_id,
                        principalTable: "lotes",
                        principalColumn: "lote_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lote_galpones",
                columns: table => new
                {
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reproductora_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    galpon_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    macho = table.Column<int>(type: "integer", nullable: true),
                    hembra = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lote_galpones", x => new { x.lote_id, x.reproductora_id, x.galpon_id });
                    table.ForeignKey(
                        name: "fk_lote_galpones_galpones_galpon_id",
                        column: x => x.galpon_id,
                        principalTable: "galpones",
                        principalColumn: "galpon_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_lote_galpones_lote_reproductoras_lote_id_reproductora_id",
                        columns: x => new { x.lote_id, x.reproductora_id },
                        principalTable: "lote_reproductoras",
                        principalColumns: new[] { "lote_id", "reproductora_id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_lote_galpones_galpon_id",
                table: "lote_galpones",
                column: "galpon_id");

            migrationBuilder.CreateIndex(
                name: "ix_lotes_granja_id",
                table: "lotes",
                column: "granja_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lote_galpones");

            migrationBuilder.DropTable(
                name: "lote_reproductoras");

            migrationBuilder.DropTable(
                name: "lotes");
        }
    }
}
