using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixMunicipioFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_departamentos_paises_dpto_pais_id",
                table: "departamentos");

            migrationBuilder.DropForeignKey(
                name: "fk_municipios_departamentos_mun_pais_id_mun_dpto_id",
                table: "municipios");

            migrationBuilder.DropPrimaryKey(
                name: "pk_municipios",
                table: "municipios");

            migrationBuilder.DropPrimaryKey(
                name: "pk_departamentos",
                table: "departamentos");

            migrationBuilder.DropColumn(
                name: "mun_pais_id",
                table: "municipios");

            migrationBuilder.RenameColumn(
                name: "mun_nombre",
                table: "municipios",
                newName: "municipio_nombre");

            migrationBuilder.RenameColumn(
                name: "mun_id",
                table: "municipios",
                newName: "departamento_id");

            migrationBuilder.RenameColumn(
                name: "mun_dpto_id",
                table: "municipios",
                newName: "municipio_id");

            migrationBuilder.RenameColumn(
                name: "dpto_nombre",
                table: "departamentos",
                newName: "departamento_nombre");

            migrationBuilder.RenameColumn(
                name: "dpto_id",
                table: "departamentos",
                newName: "pais_id");

            migrationBuilder.RenameColumn(
                name: "dpto_pais_id",
                table: "departamentos",
                newName: "departamento_id");

            migrationBuilder.AlterColumn<int>(
                name: "municipio_id",
                table: "municipios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "departamento_id",
                table: "departamentos",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<bool>(
                name: "active",
                table: "departamentos",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddPrimaryKey(
                name: "pk_municipio",
                table: "municipios",
                column: "municipio_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_departamento",
                table: "departamentos",
                column: "departamento_id");

            migrationBuilder.CreateIndex(
                name: "ix_municipios_departamento_id",
                table: "municipios",
                column: "departamento_id");

            migrationBuilder.CreateIndex(
                name: "ix_departamentos_pais_id",
                table: "departamentos",
                column: "pais_id");

            migrationBuilder.AddForeignKey(
                name: "fk_departamentos_paises_pais_id",
                table: "departamentos",
                column: "pais_id",
                principalTable: "paises",
                principalColumn: "pais_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_municipios_departamentos_departamento_id",
                table: "municipios",
                column: "departamento_id",
                principalTable: "departamentos",
                principalColumn: "departamento_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_departamentos_paises_pais_id",
                table: "departamentos");

            migrationBuilder.DropForeignKey(
                name: "fk_municipios_departamentos_departamento_id",
                table: "municipios");

            migrationBuilder.DropPrimaryKey(
                name: "pk_municipio",
                table: "municipios");

            migrationBuilder.DropIndex(
                name: "ix_municipios_departamento_id",
                table: "municipios");

            migrationBuilder.DropPrimaryKey(
                name: "pk_departamento",
                table: "departamentos");

            migrationBuilder.DropIndex(
                name: "ix_departamentos_pais_id",
                table: "departamentos");

            migrationBuilder.DropColumn(
                name: "active",
                table: "departamentos");

            migrationBuilder.RenameColumn(
                name: "municipio_nombre",
                table: "municipios",
                newName: "mun_nombre");

            migrationBuilder.RenameColumn(
                name: "departamento_id",
                table: "municipios",
                newName: "mun_id");

            migrationBuilder.RenameColumn(
                name: "municipio_id",
                table: "municipios",
                newName: "mun_dpto_id");

            migrationBuilder.RenameColumn(
                name: "pais_id",
                table: "departamentos",
                newName: "dpto_id");

            migrationBuilder.RenameColumn(
                name: "departamento_nombre",
                table: "departamentos",
                newName: "dpto_nombre");

            migrationBuilder.RenameColumn(
                name: "departamento_id",
                table: "departamentos",
                newName: "dpto_pais_id");

            migrationBuilder.AlterColumn<int>(
                name: "mun_dpto_id",
                table: "municipios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "mun_pais_id",
                table: "municipios",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "dpto_pais_id",
                table: "departamentos",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "pk_municipios",
                table: "municipios",
                columns: new[] { "mun_pais_id", "mun_dpto_id", "mun_id" });

            migrationBuilder.AddPrimaryKey(
                name: "pk_departamentos",
                table: "departamentos",
                columns: new[] { "dpto_pais_id", "dpto_id" });

            migrationBuilder.AddForeignKey(
                name: "fk_departamentos_paises_dpto_pais_id",
                table: "departamentos",
                column: "dpto_pais_id",
                principalTable: "paises",
                principalColumn: "pais_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_municipios_departamentos_mun_pais_id_mun_dpto_id",
                table: "municipios",
                columns: new[] { "mun_pais_id", "mun_dpto_id" },
                principalTable: "departamentos",
                principalColumns: new[] { "dpto_pais_id", "dpto_id" },
                onDelete: ReferentialAction.Cascade);
        }
    }
}
