using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class GrindSizeDecimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "BrewLogEntries"
                ALTER COLUMN "GrindSize" TYPE numeric(8,2)
                USING CASE
                    WHEN "GrindSize" IS NULL OR btrim("GrindSize") = '' THEN NULL
                    WHEN btrim("GrindSize") ~ '^[+-]?([0-9]+([.][0-9]+)?|[.][0-9]+)$'
                        THEN btrim("GrindSize")::numeric(8,2)
                    ELSE NULL
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "BrewLogEntries"
                ALTER COLUMN "GrindSize" TYPE character varying(10)
                USING CASE
                    WHEN "GrindSize" IS NULL THEN NULL
                    ELSE "GrindSize"::text
                END;
                """);
        }
    }
}
