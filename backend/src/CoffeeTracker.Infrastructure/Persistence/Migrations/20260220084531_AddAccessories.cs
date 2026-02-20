using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accessories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accessories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccessoryBrewer",
                columns: table => new
                {
                    AccessoriesId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompatibleBrewersId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessoryBrewer", x => new { x.AccessoriesId, x.CompatibleBrewersId });
                    table.ForeignKey(
                        name: "FK_AccessoryBrewer_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Accessories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccessoryBrewer_Brewers_CompatibleBrewersId",
                        column: x => x.CompatibleBrewersId,
                        principalTable: "Brewers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessoryBrewer_CompatibleBrewersId",
                table: "AccessoryBrewer",
                column: "CompatibleBrewersId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessoryBrewer");

            migrationBuilder.DropTable(
                name: "Accessories");
        }
    }
}
