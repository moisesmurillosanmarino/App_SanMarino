using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Remove_Role_CompanyId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_role_companies_roles_role_id1",
                table: "role_companies");

            migrationBuilder.DropForeignKey(
                name: "fk_roles_companies_company_id",
                table: "roles");

            migrationBuilder.DropIndex(
                name: "ix_roles_company_id",
                table: "roles");

            migrationBuilder.DropIndex(
                name: "ix_role_companies_role_id1",
                table: "role_companies");

            migrationBuilder.DropColumn(
                name: "company_id",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "role_id1",
                table: "role_companies");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "roles",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250);

            migrationBuilder.CreateIndex(
                name: "ix_roles_name",
                table: "roles",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_roles_name",
                table: "roles");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "roles",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "company_id",
                table: "roles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "role_id1",
                table: "role_companies",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_roles_company_id",
                table: "roles",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_companies_role_id1",
                table: "role_companies",
                column: "role_id1");

            migrationBuilder.AddForeignKey(
                name: "fk_role_companies_roles_role_id1",
                table: "role_companies",
                column: "role_id1",
                principalTable: "roles",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_roles_companies_company_id",
                table: "roles",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
