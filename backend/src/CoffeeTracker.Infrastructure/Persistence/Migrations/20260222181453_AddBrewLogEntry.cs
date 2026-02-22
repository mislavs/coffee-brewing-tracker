using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBrewLogEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BrewLogEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BeanId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    GrinderId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Dose = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    WaterAmount = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    WaterTemperature = table.Column<decimal>(type: "numeric(5,1)", precision: 5, scale: 1, nullable: true),
                    GrindSize = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    BrewTimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AdjustmentIdeas = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BrewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrewLogEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BrewLogEntries_Beans_BeanId",
                        column: x => x.BeanId,
                        principalTable: "Beans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BrewLogEntries_Brewers_BrewerId",
                        column: x => x.BrewerId,
                        principalTable: "Brewers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BrewLogEntries_Grinders_GrinderId",
                        column: x => x.GrinderId,
                        principalTable: "Grinders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BrewLogEntries_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BrewLogAccessory",
                columns: table => new
                {
                    AccessoriesId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrewLogEntryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrewLogAccessory", x => new { x.AccessoriesId, x.BrewLogEntryId });
                    table.ForeignKey(
                        name: "FK_BrewLogAccessory_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Accessories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BrewLogAccessory_BrewLogEntries_BrewLogEntryId",
                        column: x => x.BrewLogEntryId,
                        principalTable: "BrewLogEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BrewLogAccessory_BrewLogEntryId",
                table: "BrewLogAccessory",
                column: "BrewLogEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_BrewLogEntries_BeanId",
                table: "BrewLogEntries",
                column: "BeanId");

            migrationBuilder.CreateIndex(
                name: "IX_BrewLogEntries_BrewerId",
                table: "BrewLogEntries",
                column: "BrewerId");

            migrationBuilder.CreateIndex(
                name: "IX_BrewLogEntries_GrinderId",
                table: "BrewLogEntries",
                column: "GrinderId");

            migrationBuilder.CreateIndex(
                name: "IX_BrewLogEntries_RecipeId",
                table: "BrewLogEntries",
                column: "RecipeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BrewLogAccessory");

            migrationBuilder.DropTable(
                name: "BrewLogEntries");
        }
    }
}
