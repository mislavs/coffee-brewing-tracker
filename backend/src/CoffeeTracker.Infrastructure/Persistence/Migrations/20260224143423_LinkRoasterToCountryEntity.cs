using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LinkRoasterToCountryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                table: "Roasters",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                CREATE EXTENSION IF NOT EXISTS "pgcrypto";
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO "Countries" ("Id", "Name")
                SELECT gen_random_uuid(), source."CountryName"
                FROM (
                    SELECT DISTINCT BTRIM("Country") AS "CountryName"
                    FROM "Roasters"
                    WHERE "Country" IS NOT NULL
                      AND BTRIM("Country") <> ''
                ) AS source
                LEFT JOIN "Countries" country
                    ON LOWER(country."Name") = LOWER(source."CountryName")
                WHERE country."Id" IS NULL;
                """);

            migrationBuilder.Sql(
                """
                UPDATE "Roasters" roaster
                SET "CountryId" = country."Id"
                FROM "Countries" country
                WHERE roaster."Country" IS NOT NULL
                  AND BTRIM(roaster."Country") <> ''
                  AND LOWER(country."Name") = LOWER(BTRIM(roaster."Country"));
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Roasters_CountryId",
                table: "Roasters",
                column: "CountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Roasters_Countries_CountryId",
                table: "Roasters",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Roasters");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Roasters",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Roasters" roaster
                SET "Country" = country."Name"
                FROM "Countries" country
                WHERE roaster."CountryId" = country."Id";
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Roasters_Countries_CountryId",
                table: "Roasters");

            migrationBuilder.DropIndex(
                name: "IX_Roasters_CountryId",
                table: "Roasters");

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Roasters");
        }
    }
}
