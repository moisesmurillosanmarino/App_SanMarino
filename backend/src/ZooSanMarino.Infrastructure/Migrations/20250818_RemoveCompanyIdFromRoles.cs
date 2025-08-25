// src/ZooSanMarino.Infrastructure/Persistence/Migrations/20250818_RemoveCompanyIdFromRoles.cs
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

public partial class RemoveCompanyIdFromRoles : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Si existían índices/FK antiguas, elimínalas con estos nombres reales.
        // Cambia los nombres si tu esquema los difiere.
        try
        {
            migrationBuilder.DropForeignKey(
                name: "fk_roles_companies_company_id",
                table: "roles");
        }
        catch { /* por si no existe en este ambiente */ }

        try
        {
            migrationBuilder.DropIndex(
                name: "ix_roles_company_id",
                table: "roles");
        }
        catch { /* por si no existe */ }

        try
        {
            migrationBuilder.DropColumn(
                name: "company_id",
                table: "roles");
        }
        catch { /* por si ya no existe */ }
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "company_id",
            table: "roles",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_roles_company_id",
            table: "roles",
            column: "company_id");

        migrationBuilder.AddForeignKey(
            name: "fk_roles_companies_company_id",
            table: "roles",
            column: "company_id",
            principalTable: "companies",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }
}
