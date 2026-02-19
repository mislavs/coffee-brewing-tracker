using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBeansAndFlavorNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Beans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RoasterId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginType = table.Column<string>(type: "text", nullable: false),
                    Variety = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ProcessingMethod = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RoastProfile = table.Column<string>(type: "text", nullable: false),
                    RoastDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Altitude = table.Column<int>(type: "integer", nullable: true),
                    BagWeight = table.Column<decimal>(type: "numeric", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Beans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Beans_Roasters_RoasterId",
                        column: x => x.RoasterId,
                        principalTable: "Roasters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FlavorNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlavorNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BeanCountry",
                columns: table => new
                {
                    BeanId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginCountriesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeanCountry", x => new { x.BeanId, x.OriginCountriesId });
                    table.ForeignKey(
                        name: "FK_BeanCountry_Beans_BeanId",
                        column: x => x.BeanId,
                        principalTable: "Beans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BeanCountry_Countries_OriginCountriesId",
                        column: x => x.OriginCountriesId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BeanFlavorNote",
                columns: table => new
                {
                    BeanId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlavorNotesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeanFlavorNote", x => new { x.BeanId, x.FlavorNotesId });
                    table.ForeignKey(
                        name: "FK_BeanFlavorNote_Beans_BeanId",
                        column: x => x.BeanId,
                        principalTable: "Beans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BeanFlavorNote_FlavorNotes_FlavorNotesId",
                        column: x => x.FlavorNotesId,
                        principalTable: "FlavorNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BeanCountry_OriginCountriesId",
                table: "BeanCountry",
                column: "OriginCountriesId");

            migrationBuilder.CreateIndex(
                name: "IX_BeanFlavorNote_FlavorNotesId",
                table: "BeanFlavorNote",
                column: "FlavorNotesId");

            migrationBuilder.CreateIndex(
                name: "IX_Beans_RoasterId",
                table: "Beans",
                column: "RoasterId");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Name",
                table: "Countries",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlavorNotes_Name",
                table: "FlavorNotes",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BeanCountry");

            migrationBuilder.DropTable(
                name: "BeanFlavorNote");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "Beans");

            migrationBuilder.DropTable(
                name: "FlavorNotes");
        }
    }
}
