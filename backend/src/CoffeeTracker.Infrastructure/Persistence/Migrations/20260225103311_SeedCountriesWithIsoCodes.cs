using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoffeeTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedCountriesWithIsoCodes : Migration
    {
    private static readonly Guid CountryIdNamespace = new("3dbe37ca-0a37-4e17-b1d0-385f3211096d");

    private static readonly CountrySeed[] Countries =
        JsonSerializer.Deserialize<CountrySeed[]>(CountriesJson)
        ?? throw new InvalidOperationException("Country seed dataset is invalid.");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IsoAlpha2",
                table: "Countries",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IsoNumericCode",
                table: "Countries",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

        migrationBuilder.Sql(
            """
            CREATE TEMP TABLE "TempOldRoasterCountries" AS
            SELECT r."Id" AS "RoasterId", c."Name" AS "CountryName"
            FROM "Roasters" r
            JOIN "Countries" c ON r."CountryId" = c."Id"
            WHERE r."CountryId" IS NOT NULL;
            
            CREATE TEMP TABLE "TempOldBeanCountries" AS
            SELECT bc."BeanId", c."Name" AS "CountryName"
            FROM "BeanCountry" bc
            JOIN "Countries" c ON bc."OriginCountriesId" = c."Id";
            """);

        migrationBuilder.Sql(
            """
            UPDATE "Roasters"
            SET "CountryId" = NULL
            WHERE "CountryId" IS NOT NULL;
            
            DELETE FROM "BeanCountry";
            DELETE FROM "Countries";
            """);

        migrationBuilder.Sql(BuildSeedCountriesInsertSql());

        migrationBuilder.Sql(
            """
            UPDATE "Roasters" r
            SET "CountryId" = c."Id"
            FROM "TempOldRoasterCountries" oldCountry
            JOIN "Countries" c
                ON LOWER(BTRIM(c."Name")) = LOWER(BTRIM(oldCountry."CountryName"))
            WHERE r."Id" = oldCountry."RoasterId";
            
            INSERT INTO "BeanCountry" ("BeanId", "OriginCountriesId")
            SELECT DISTINCT oldCountry."BeanId", c."Id"
            FROM "TempOldBeanCountries" oldCountry
            JOIN "Countries" c
                ON LOWER(BTRIM(c."Name")) = LOWER(BTRIM(oldCountry."CountryName"))
            ON CONFLICT ("BeanId", "OriginCountriesId") DO NOTHING;
            
            DROP TABLE IF EXISTS "TempOldRoasterCountries";
            DROP TABLE IF EXISTS "TempOldBeanCountries";
            """);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_IsoAlpha2",
                table: "Countries",
                column: "IsoAlpha2",
                unique: true,
                filter: "\"IsoAlpha2\" <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_IsoNumericCode",
                table: "Countries",
                column: "IsoNumericCode",
                unique: true,
                filter: "\"IsoNumericCode\" <> ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Countries_IsoAlpha2",
                table: "Countries");

            migrationBuilder.DropIndex(
                name: "IX_Countries_IsoNumericCode",
                table: "Countries");

            migrationBuilder.DropColumn(
                name: "IsoAlpha2",
                table: "Countries");

            migrationBuilder.DropColumn(
                name: "IsoNumericCode",
                table: "Countries");
        }

    private static string BuildSeedCountriesInsertSql()
    {
        var sqlBuilder = new StringBuilder();
        sqlBuilder.AppendLine("""INSERT INTO "Countries" ("Id", "Name", "IsoAlpha2", "IsoNumericCode") VALUES""");

        for (var index = 0; index < Countries.Length; index++)
        {
            var country = Countries[index];
            var countryId = CreateDeterministicCountryId(country.IsoNumericCode);
            var suffix = index == Countries.Length - 1 ? ";" : ",";

            sqlBuilder.Append("  ('")
                .Append(countryId)
                .Append("', '")
                .Append(EscapeSqlLiteral(country.Name))
                .Append("', '")
                .Append(country.IsoAlpha2)
                .Append("', '")
                .Append(country.IsoNumericCode)
                .Append("')")
                .AppendLine(suffix);
        }

        return sqlBuilder.ToString();
    }

    private static Guid CreateDeterministicCountryId(string isoNumericCode)
    {
        return CreateVersion5Guid(CountryIdNamespace, isoNumericCode);
    }

    private static Guid CreateVersion5Guid(Guid namespaceId, string name)
    {
        var namespaceBytes = namespaceId.ToByteArray();
        SwapByteOrder(namespaceBytes);

        var nameBytes = Encoding.UTF8.GetBytes(name);
        var data = new byte[namespaceBytes.Length + nameBytes.Length];
        Buffer.BlockCopy(namespaceBytes, 0, data, 0, namespaceBytes.Length);
        Buffer.BlockCopy(nameBytes, 0, data, namespaceBytes.Length, nameBytes.Length);

        var hash = SHA1.HashData(data);
        var newGuid = new byte[16];
        Array.Copy(hash, 0, newGuid, 0, newGuid.Length);

        newGuid[6] = (byte)((newGuid[6] & 0x0F) | 0x50);
        newGuid[8] = (byte)((newGuid[8] & 0x3F) | 0x80);

        SwapByteOrder(newGuid);
        return new Guid(newGuid);
    }

    private static void SwapByteOrder(byte[] guid)
    {
        (guid[0], guid[3]) = (guid[3], guid[0]);
        (guid[1], guid[2]) = (guid[2], guid[1]);
        (guid[4], guid[5]) = (guid[5], guid[4]);
        (guid[6], guid[7]) = (guid[7], guid[6]);
    }

    private static string EscapeSqlLiteral(string value)
    {
        return value.Replace("'", "''");
    }

    private sealed record CountrySeed(string Name, string IsoAlpha2, string IsoNumericCode);

    private const string CountriesJson = """
[{"Name":"Afghanistan","IsoAlpha2":"AF","IsoNumericCode":"004"},{"Name":"Albania","IsoAlpha2":"AL","IsoNumericCode":"008"},{"Name":"Algeria","IsoAlpha2":"DZ","IsoNumericCode":"012"},{"Name":"Andorra","IsoAlpha2":"AD","IsoNumericCode":"020"},{"Name":"Angola","IsoAlpha2":"AO","IsoNumericCode":"024"},{"Name":"Antigua and Barbuda","IsoAlpha2":"AG","IsoNumericCode":"028"},{"Name":"Argentina","IsoAlpha2":"AR","IsoNumericCode":"032"},{"Name":"Armenia","IsoAlpha2":"AM","IsoNumericCode":"051"},{"Name":"Australia","IsoAlpha2":"AU","IsoNumericCode":"036"},{"Name":"Austria","IsoAlpha2":"AT","IsoNumericCode":"040"},{"Name":"Azerbaijan","IsoAlpha2":"AZ","IsoNumericCode":"031"},{"Name":"Bahamas","IsoAlpha2":"BS","IsoNumericCode":"044"},{"Name":"Bahrain","IsoAlpha2":"BH","IsoNumericCode":"048"},{"Name":"Bangladesh","IsoAlpha2":"BD","IsoNumericCode":"050"},{"Name":"Barbados","IsoAlpha2":"BB","IsoNumericCode":"052"},{"Name":"Belarus","IsoAlpha2":"BY","IsoNumericCode":"112"},{"Name":"Belgium","IsoAlpha2":"BE","IsoNumericCode":"056"},{"Name":"Belize","IsoAlpha2":"BZ","IsoNumericCode":"084"},{"Name":"Benin","IsoAlpha2":"BJ","IsoNumericCode":"204"},{"Name":"Bhutan","IsoAlpha2":"BT","IsoNumericCode":"064"},{"Name":"Bolivia","IsoAlpha2":"BO","IsoNumericCode":"068"},{"Name":"Bosnia and Herzegovina","IsoAlpha2":"BA","IsoNumericCode":"070"},{"Name":"Botswana","IsoAlpha2":"BW","IsoNumericCode":"072"},{"Name":"Brazil","IsoAlpha2":"BR","IsoNumericCode":"076"},{"Name":"Brunei","IsoAlpha2":"BN","IsoNumericCode":"096"},{"Name":"Bulgaria","IsoAlpha2":"BG","IsoNumericCode":"100"},{"Name":"Burkina Faso","IsoAlpha2":"BF","IsoNumericCode":"854"},{"Name":"Burundi","IsoAlpha2":"BI","IsoNumericCode":"108"},{"Name":"Cambodia","IsoAlpha2":"KH","IsoNumericCode":"116"},{"Name":"Cameroon","IsoAlpha2":"CM","IsoNumericCode":"120"},{"Name":"Canada","IsoAlpha2":"CA","IsoNumericCode":"124"},{"Name":"Cape Verde","IsoAlpha2":"CV","IsoNumericCode":"132"},{"Name":"Central African Republic","IsoAlpha2":"CF","IsoNumericCode":"140"},{"Name":"Chad","IsoAlpha2":"TD","IsoNumericCode":"148"},{"Name":"Chile","IsoAlpha2":"CL","IsoNumericCode":"152"},{"Name":"China","IsoAlpha2":"CN","IsoNumericCode":"156"},{"Name":"Colombia","IsoAlpha2":"CO","IsoNumericCode":"170"},{"Name":"Comoros","IsoAlpha2":"KM","IsoNumericCode":"174"},{"Name":"Costa Rica","IsoAlpha2":"CR","IsoNumericCode":"188"},{"Name":"Croatia","IsoAlpha2":"HR","IsoNumericCode":"191"},{"Name":"Cuba","IsoAlpha2":"CU","IsoNumericCode":"192"},{"Name":"Cyprus","IsoAlpha2":"CY","IsoNumericCode":"196"},{"Name":"Czechia","IsoAlpha2":"CZ","IsoNumericCode":"203"},{"Name":"Denmark","IsoAlpha2":"DK","IsoNumericCode":"208"},{"Name":"Djibouti","IsoAlpha2":"DJ","IsoNumericCode":"262"},{"Name":"Dominica","IsoAlpha2":"DM","IsoNumericCode":"212"},{"Name":"Dominican Republic","IsoAlpha2":"DO","IsoNumericCode":"214"},{"Name":"DR Congo","IsoAlpha2":"CD","IsoNumericCode":"180"},{"Name":"Ecuador","IsoAlpha2":"EC","IsoNumericCode":"218"},{"Name":"Egypt","IsoAlpha2":"EG","IsoNumericCode":"818"},{"Name":"El Salvador","IsoAlpha2":"SV","IsoNumericCode":"222"},{"Name":"Equatorial Guinea","IsoAlpha2":"GQ","IsoNumericCode":"226"},{"Name":"Eritrea","IsoAlpha2":"ER","IsoNumericCode":"232"},{"Name":"Estonia","IsoAlpha2":"EE","IsoNumericCode":"233"},{"Name":"Eswatini","IsoAlpha2":"SZ","IsoNumericCode":"748"},{"Name":"Ethiopia","IsoAlpha2":"ET","IsoNumericCode":"231"},{"Name":"Fiji","IsoAlpha2":"FJ","IsoNumericCode":"242"},{"Name":"Finland","IsoAlpha2":"FI","IsoNumericCode":"246"},{"Name":"France","IsoAlpha2":"FR","IsoNumericCode":"250"},{"Name":"Gabon","IsoAlpha2":"GA","IsoNumericCode":"266"},{"Name":"Gambia","IsoAlpha2":"GM","IsoNumericCode":"270"},{"Name":"Georgia","IsoAlpha2":"GE","IsoNumericCode":"268"},{"Name":"Germany","IsoAlpha2":"DE","IsoNumericCode":"276"},{"Name":"Ghana","IsoAlpha2":"GH","IsoNumericCode":"288"},{"Name":"Greece","IsoAlpha2":"GR","IsoNumericCode":"300"},{"Name":"Grenada","IsoAlpha2":"GD","IsoNumericCode":"308"},{"Name":"Guatemala","IsoAlpha2":"GT","IsoNumericCode":"320"},{"Name":"Guinea","IsoAlpha2":"GN","IsoNumericCode":"324"},{"Name":"Guinea-Bissau","IsoAlpha2":"GW","IsoNumericCode":"624"},{"Name":"Guyana","IsoAlpha2":"GY","IsoNumericCode":"328"},{"Name":"Haiti","IsoAlpha2":"HT","IsoNumericCode":"332"},{"Name":"Honduras","IsoAlpha2":"HN","IsoNumericCode":"340"},{"Name":"Hungary","IsoAlpha2":"HU","IsoNumericCode":"348"},{"Name":"Iceland","IsoAlpha2":"IS","IsoNumericCode":"352"},{"Name":"India","IsoAlpha2":"IN","IsoNumericCode":"356"},{"Name":"Indonesia","IsoAlpha2":"ID","IsoNumericCode":"360"},{"Name":"Iran","IsoAlpha2":"IR","IsoNumericCode":"364"},{"Name":"Iraq","IsoAlpha2":"IQ","IsoNumericCode":"368"},{"Name":"Ireland","IsoAlpha2":"IE","IsoNumericCode":"372"},{"Name":"Israel","IsoAlpha2":"IL","IsoNumericCode":"376"},{"Name":"Italy","IsoAlpha2":"IT","IsoNumericCode":"380"},{"Name":"Ivory Coast","IsoAlpha2":"CI","IsoNumericCode":"384"},{"Name":"Jamaica","IsoAlpha2":"JM","IsoNumericCode":"388"},{"Name":"Japan","IsoAlpha2":"JP","IsoNumericCode":"392"},{"Name":"Jordan","IsoAlpha2":"JO","IsoNumericCode":"400"},{"Name":"Kazakhstan","IsoAlpha2":"KZ","IsoNumericCode":"398"},{"Name":"Kenya","IsoAlpha2":"KE","IsoNumericCode":"404"},{"Name":"Kiribati","IsoAlpha2":"KI","IsoNumericCode":"296"},{"Name":"Kuwait","IsoAlpha2":"KW","IsoNumericCode":"414"},{"Name":"Kyrgyzstan","IsoAlpha2":"KG","IsoNumericCode":"417"},{"Name":"Laos","IsoAlpha2":"LA","IsoNumericCode":"418"},{"Name":"Latvia","IsoAlpha2":"LV","IsoNumericCode":"428"},{"Name":"Lebanon","IsoAlpha2":"LB","IsoNumericCode":"422"},{"Name":"Lesotho","IsoAlpha2":"LS","IsoNumericCode":"426"},{"Name":"Liberia","IsoAlpha2":"LR","IsoNumericCode":"430"},{"Name":"Libya","IsoAlpha2":"LY","IsoNumericCode":"434"},{"Name":"Liechtenstein","IsoAlpha2":"LI","IsoNumericCode":"438"},{"Name":"Lithuania","IsoAlpha2":"LT","IsoNumericCode":"440"},{"Name":"Luxembourg","IsoAlpha2":"LU","IsoNumericCode":"442"},{"Name":"Madagascar","IsoAlpha2":"MG","IsoNumericCode":"450"},{"Name":"Malawi","IsoAlpha2":"MW","IsoNumericCode":"454"},{"Name":"Malaysia","IsoAlpha2":"MY","IsoNumericCode":"458"},{"Name":"Maldives","IsoAlpha2":"MV","IsoNumericCode":"462"},{"Name":"Mali","IsoAlpha2":"ML","IsoNumericCode":"466"},{"Name":"Malta","IsoAlpha2":"MT","IsoNumericCode":"470"},{"Name":"Marshall Islands","IsoAlpha2":"MH","IsoNumericCode":"584"},{"Name":"Mauritania","IsoAlpha2":"MR","IsoNumericCode":"478"},{"Name":"Mauritius","IsoAlpha2":"MU","IsoNumericCode":"480"},{"Name":"Mexico","IsoAlpha2":"MX","IsoNumericCode":"484"},{"Name":"Micronesia","IsoAlpha2":"FM","IsoNumericCode":"583"},{"Name":"Moldova","IsoAlpha2":"MD","IsoNumericCode":"498"},{"Name":"Monaco","IsoAlpha2":"MC","IsoNumericCode":"492"},{"Name":"Mongolia","IsoAlpha2":"MN","IsoNumericCode":"496"},{"Name":"Montenegro","IsoAlpha2":"ME","IsoNumericCode":"499"},{"Name":"Morocco","IsoAlpha2":"MA","IsoNumericCode":"504"},{"Name":"Mozambique","IsoAlpha2":"MZ","IsoNumericCode":"508"},{"Name":"Myanmar","IsoAlpha2":"MM","IsoNumericCode":"104"},{"Name":"Namibia","IsoAlpha2":"NA","IsoNumericCode":"516"},{"Name":"Nauru","IsoAlpha2":"NR","IsoNumericCode":"520"},{"Name":"Nepal","IsoAlpha2":"NP","IsoNumericCode":"524"},{"Name":"Netherlands","IsoAlpha2":"NL","IsoNumericCode":"528"},{"Name":"New Zealand","IsoAlpha2":"NZ","IsoNumericCode":"554"},{"Name":"Nicaragua","IsoAlpha2":"NI","IsoNumericCode":"558"},{"Name":"Niger","IsoAlpha2":"NE","IsoNumericCode":"562"},{"Name":"Nigeria","IsoAlpha2":"NG","IsoNumericCode":"566"},{"Name":"North Korea","IsoAlpha2":"KP","IsoNumericCode":"408"},{"Name":"North Macedonia","IsoAlpha2":"MK","IsoNumericCode":"807"},{"Name":"Norway","IsoAlpha2":"NO","IsoNumericCode":"578"},{"Name":"Oman","IsoAlpha2":"OM","IsoNumericCode":"512"},{"Name":"Pakistan","IsoAlpha2":"PK","IsoNumericCode":"586"},{"Name":"Palau","IsoAlpha2":"PW","IsoNumericCode":"585"},{"Name":"Palestine","IsoAlpha2":"PS","IsoNumericCode":"275"},{"Name":"Panama","IsoAlpha2":"PA","IsoNumericCode":"591"},{"Name":"Papua New Guinea","IsoAlpha2":"PG","IsoNumericCode":"598"},{"Name":"Paraguay","IsoAlpha2":"PY","IsoNumericCode":"600"},{"Name":"Peru","IsoAlpha2":"PE","IsoNumericCode":"604"},{"Name":"Philippines","IsoAlpha2":"PH","IsoNumericCode":"608"},{"Name":"Poland","IsoAlpha2":"PL","IsoNumericCode":"616"},{"Name":"Portugal","IsoAlpha2":"PT","IsoNumericCode":"620"},{"Name":"Qatar","IsoAlpha2":"QA","IsoNumericCode":"634"},{"Name":"Republic of the Congo","IsoAlpha2":"CG","IsoNumericCode":"178"},{"Name":"Romania","IsoAlpha2":"RO","IsoNumericCode":"642"},{"Name":"Russia","IsoAlpha2":"RU","IsoNumericCode":"643"},{"Name":"Rwanda","IsoAlpha2":"RW","IsoNumericCode":"646"},{"Name":"Saint Kitts and Nevis","IsoAlpha2":"KN","IsoNumericCode":"659"},{"Name":"Saint Lucia","IsoAlpha2":"LC","IsoNumericCode":"662"},{"Name":"Saint Vincent and the Grenadines","IsoAlpha2":"VC","IsoNumericCode":"670"},{"Name":"Samoa","IsoAlpha2":"WS","IsoNumericCode":"882"},{"Name":"San Marino","IsoAlpha2":"SM","IsoNumericCode":"674"},{"Name":"Sao Tome and Principe","IsoAlpha2":"ST","IsoNumericCode":"678"},{"Name":"Saudi Arabia","IsoAlpha2":"SA","IsoNumericCode":"682"},{"Name":"Senegal","IsoAlpha2":"SN","IsoNumericCode":"686"},{"Name":"Serbia","IsoAlpha2":"RS","IsoNumericCode":"688"},{"Name":"Seychelles","IsoAlpha2":"SC","IsoNumericCode":"690"},{"Name":"Sierra Leone","IsoAlpha2":"SL","IsoNumericCode":"694"},{"Name":"Singapore","IsoAlpha2":"SG","IsoNumericCode":"702"},{"Name":"Slovakia","IsoAlpha2":"SK","IsoNumericCode":"703"},{"Name":"Slovenia","IsoAlpha2":"SI","IsoNumericCode":"705"},{"Name":"Solomon Islands","IsoAlpha2":"SB","IsoNumericCode":"090"},{"Name":"Somalia","IsoAlpha2":"SO","IsoNumericCode":"706"},{"Name":"South Africa","IsoAlpha2":"ZA","IsoNumericCode":"710"},{"Name":"South Korea","IsoAlpha2":"KR","IsoNumericCode":"410"},{"Name":"South Sudan","IsoAlpha2":"SS","IsoNumericCode":"728"},{"Name":"Spain","IsoAlpha2":"ES","IsoNumericCode":"724"},{"Name":"Sri Lanka","IsoAlpha2":"LK","IsoNumericCode":"144"},{"Name":"Sudan","IsoAlpha2":"SD","IsoNumericCode":"729"},{"Name":"Suriname","IsoAlpha2":"SR","IsoNumericCode":"740"},{"Name":"Sweden","IsoAlpha2":"SE","IsoNumericCode":"752"},{"Name":"Switzerland","IsoAlpha2":"CH","IsoNumericCode":"756"},{"Name":"Syria","IsoAlpha2":"SY","IsoNumericCode":"760"},{"Name":"Tajikistan","IsoAlpha2":"TJ","IsoNumericCode":"762"},{"Name":"Tanzania","IsoAlpha2":"TZ","IsoNumericCode":"834"},{"Name":"Thailand","IsoAlpha2":"TH","IsoNumericCode":"764"},{"Name":"Timor-Leste","IsoAlpha2":"TL","IsoNumericCode":"626"},{"Name":"Togo","IsoAlpha2":"TG","IsoNumericCode":"768"},{"Name":"Tonga","IsoAlpha2":"TO","IsoNumericCode":"776"},{"Name":"Trinidad and Tobago","IsoAlpha2":"TT","IsoNumericCode":"780"},{"Name":"Tunisia","IsoAlpha2":"TN","IsoNumericCode":"788"},{"Name":"Turkey","IsoAlpha2":"TR","IsoNumericCode":"792"},{"Name":"Turkmenistan","IsoAlpha2":"TM","IsoNumericCode":"795"},{"Name":"Tuvalu","IsoAlpha2":"TV","IsoNumericCode":"798"},{"Name":"Uganda","IsoAlpha2":"UG","IsoNumericCode":"800"},{"Name":"Ukraine","IsoAlpha2":"UA","IsoNumericCode":"804"},{"Name":"United Arab Emirates","IsoAlpha2":"AE","IsoNumericCode":"784"},{"Name":"United Kingdom","IsoAlpha2":"GB","IsoNumericCode":"826"},{"Name":"United States","IsoAlpha2":"US","IsoNumericCode":"840"},{"Name":"Uruguay","IsoAlpha2":"UY","IsoNumericCode":"858"},{"Name":"Uzbekistan","IsoAlpha2":"UZ","IsoNumericCode":"860"},{"Name":"Vanuatu","IsoAlpha2":"VU","IsoNumericCode":"548"},{"Name":"Vatican City","IsoAlpha2":"VA","IsoNumericCode":"336"},{"Name":"Venezuela","IsoAlpha2":"VE","IsoNumericCode":"862"},{"Name":"Vietnam","IsoAlpha2":"VN","IsoNumericCode":"704"},{"Name":"Yemen","IsoAlpha2":"YE","IsoNumericCode":"887"},{"Name":"Zambia","IsoAlpha2":"ZM","IsoNumericCode":"894"},{"Name":"Zimbabwe","IsoAlpha2":"ZW","IsoNumericCode":"716"}]
""";
    }
}
