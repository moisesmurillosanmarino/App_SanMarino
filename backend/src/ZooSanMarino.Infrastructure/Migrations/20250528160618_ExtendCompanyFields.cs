using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooSanMarino.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendCompanyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_by",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "document_type",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "last_updated",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "modified_by",
                table: "companies");

            migrationBuilder.RenameColumn(
                name: "nit",
                table: "companies",
                newName: "identifier");

            migrationBuilder.AlterColumn<string>(
                name: "country",
                table: "companies",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "companies",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "companies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "mobile_access",
                table: "companies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "companies",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "state",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "visual_permissions",
                table: "companies",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "address",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "city",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "email",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "mobile_access",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "state",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "visual_permissions",
                table: "companies");

            migrationBuilder.RenameColumn(
                name: "identifier",
                table: "companies",
                newName: "nit");

            migrationBuilder.AlterColumn<string>(
                name: "country",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "created_by",
                table: "companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "document_type",
                table: "companies",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "last_updated",
                table: "companies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<string>(
                name: "modified_by",
                table: "companies",
                type: "text",
                nullable: true);
        }
    }
}
