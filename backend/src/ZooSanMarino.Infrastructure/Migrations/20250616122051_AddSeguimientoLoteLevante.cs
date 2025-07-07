using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeguimientoLoteLevante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "seguimiento_lote_levante",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    lote_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    mortalidad_hembras = table.Column<int>(type: "integer", nullable: false),
                    mortalidad_machos = table.Column<int>(type: "integer", nullable: false),
                    selh = table.Column<int>(type: "integer", nullable: false),
                    selm = table.Column<int>(type: "integer", nullable: false),
                    error_sexaje_hembras = table.Column<int>(type: "integer", nullable: false),
                    error_sexaje_machos = table.Column<int>(type: "integer", nullable: false),
                    consumo_kg_hembras = table.Column<double>(type: "double precision", nullable: false),
                    tipo_alimento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    observaciones = table.Column<string>(type: "text", nullable: true),
                    kcal_alh = table.Column<double>(type: "double precision", nullable: true),
                    prot_alh = table.Column<double>(type: "double precision", nullable: true),
                    kcal_aveh = table.Column<double>(type: "double precision", nullable: true),
                    prot_aveh = table.Column<double>(type: "double precision", nullable: true),
                    fecha_ultimo_cambio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ciclo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_seguimiento_lote_levante", x => x.id);
                    table.ForeignKey(
                        name: "fk_seguimiento_lote_levante_lotes_lote_id",
                        column: x => x.lote_id,
                        principalTable: "lotes",
                        principalColumn: "lote_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_seguimiento_lote_levante_users_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_seguimiento_lote_levante_lote_id",
                table: "seguimiento_lote_levante",
                column: "lote_id");

            migrationBuilder.CreateIndex(
                name: "ix_seguimiento_lote_levante_usuario_id",
                table: "seguimiento_lote_levante",
                column: "usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "seguimiento_lote_levante");
        }
    }
}
