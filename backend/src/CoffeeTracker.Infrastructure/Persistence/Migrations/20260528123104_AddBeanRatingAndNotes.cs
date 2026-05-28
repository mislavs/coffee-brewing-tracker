using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBeanRatingAndNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Beans",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Beans",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Beans");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Beans");
        }
    }
}
