using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixNavProps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "paises",
                columns: table => new
                {
                    pais_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pais_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_paises", x => x.pais_id);
                });

            migrationBuilder.CreateTable(
                name: "regionales",
                columns: table => new
                {
                    regional_cia = table.Column<int>(type: "integer", nullable: false),
                    regional_id = table.Column<int>(type: "integer", nullable: false),
                    regional_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    regional_estado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    regional_codigo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_regionales", x => new { x.regional_cia, x.regional_id });
                    table.ForeignKey(
                        name: "fk_regionales_companies_regional_cia",
                        column: x => x.regional_cia,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "zonas",
                columns: table => new
                {
                    zona_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    zona_cia = table.Column<int>(type: "integer", nullable: false),
                    zona_nombre = table.Column<string>(type: "text", nullable: false),
                    zona_estado = table.Column<string>(type: "text", nullable: false),
                    company_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_zonas", x => x.zona_id);
                    table.ForeignKey(
                        name: "fk_zonas_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "departamentos",
                columns: table => new
                {
                    dpto_pais_id = table.Column<int>(type: "integer", nullable: false),
                    dpto_id = table.Column<int>(type: "integer", nullable: false),
                    dpto_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_departamentos", x => new { x.dpto_pais_id, x.dpto_id });
                    table.ForeignKey(
                        name: "fk_departamentos_paises_dpto_pais_id",
                        column: x => x.dpto_pais_id,
                        principalTable: "paises",
                        principalColumn: "pais_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "municipios",
                columns: table => new
                {
                    mun_pais_id = table.Column<int>(type: "integer", nullable: false),
                    mun_dpto_id = table.Column<int>(type: "integer", nullable: false),
                    mun_id = table.Column<int>(type: "integer", nullable: false),
                    mun_nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_municipios", x => new { x.mun_pais_id, x.mun_dpto_id, x.mun_id });
                    table.ForeignKey(
                        name: "fk_municipios_departamentos_mun_pais_id_mun_dpto_id",
                        columns: x => new { x.mun_pais_id, x.mun_dpto_id },
                        principalTable: "departamentos",
                        principalColumns: new[] { "dpto_pais_id", "dpto_id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_zonas_company_id",
                table: "zonas",
                column: "company_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "municipios");

            migrationBuilder.DropTable(
                name: "regionales");

            migrationBuilder.DropTable(
                name: "zonas");

            migrationBuilder.DropTable(
                name: "departamentos");

            migrationBuilder.DropTable(
                name: "paises");
        }
    }
}
