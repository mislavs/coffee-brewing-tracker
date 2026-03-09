using CoffeeTracker.Application.Features.Stats.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Stats.Queries.GetCountryMapStats;

[Collection(nameof(IntegrationTestsCollection))]
public class GetCountryMapStatsHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCountriesHaveBeans_ReturnsAggregatedStatsForEachCountry()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster stats", null, null);
        var kenya = Country.Create("Kenya", "KE", "404");
        var ethiopia = Country.Create("Ethiopia", "ET", "231");
        await Insert(roaster);
        await InsertMany([kenya, ethiopia]);

        var kenyaBeanA = Bean.Create(
            "Kenya AA",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            35m);
        var kenyaBeanB = Bean.Create(
            "Kenya AB",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            200m,
            32m);
        var ethiopiaBean = Bean.Create(
            "Ethiopia Guji",
            roaster.Id,
            OriginType.SingleOrigin,
            [ethiopia],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            300m,
            37m);
        await InsertMany([kenyaBeanA, kenyaBeanB, ethiopiaBean]);

        var brewer = Brewer.Create("V60");
        var grinder = Grinder.Create("K-Ultra");
        await Insert(brewer);
        await Insert(grinder);

        await InsertMany(
        [
            BrewLogEntry.Create(kenyaBeanA.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-3)),
            BrewLogEntry.Create(kenyaBeanA.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 11m, null, BrewRating.Excellent, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(kenyaBeanB.Id, brewer.Id, grinder.Id, null, 19m, 320m, null, 12m, null, null, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(ethiopiaBean.Id, brewer.Id, grinder.Id, null, 17m, 280m, null, 9m, null, BrewRating.Average, null, null, DateTime.UtcNow)
        ]);

        var query = new GetCountryMapStatsQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(2);

        var ethiopiaStats = result.Single(entry => entry.CountryId == ethiopia.Id);
        ethiopiaStats.CountryName.Should().Be("Ethiopia");
        ethiopiaStats.IsoAlpha2.Should().Be("ET");
        ethiopiaStats.IsoNumericCode.Should().Be("231");
        ethiopiaStats.BeanCount.Should().Be(1);
        ethiopiaStats.TotalBagWeightGrams.Should().Be(300m);
        ethiopiaStats.AvgBrewRating.Should().Be(3m);
        ethiopiaStats.TotalBrews.Should().Be(1);

        var kenyaStats = result.Single(entry => entry.CountryId == kenya.Id);
        kenyaStats.CountryName.Should().Be("Kenya");
        kenyaStats.IsoAlpha2.Should().Be("KE");
        kenyaStats.IsoNumericCode.Should().Be("404");
        kenyaStats.BeanCount.Should().Be(2);
        kenyaStats.TotalBagWeightGrams.Should().Be(450m);
        kenyaStats.AvgBrewRating.Should().Be(4.5m);
        kenyaStats.TotalBrews.Should().Be(3);
    }

    [Fact]
    public async Task Handle_WhenCountryHasNoBeans_ExcludesCountryFromResults()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster stats", null, null);
        var hasBeans = Country.Create("Colombia", "CO", "170");
        var noBeans = Country.Create("Peru", "PE", "604");
        await Insert(roaster);
        await InsertMany([hasBeans, noBeans]);

        var bean = Bean.Create(
            "Colombia Huila",
            roaster.Id,
            OriginType.SingleOrigin,
            [hasBeans],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
        await Insert(bean);

        var query = new GetCountryMapStatsQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().ContainSingle(entry => entry.CountryId == hasBeans.Id);
        result.Should().NotContain(entry => entry.CountryId == noBeans.Id);
    }

    [Fact]
    public async Task Handle_WhenCountryBrewsHaveNoRatings_ReturnsNullAverageRating()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster stats", null, null);
        var brazil = Country.Create("Brazil", "BR", "076");
        await Insert(roaster);
        await Insert(brazil);

        var bean = Bean.Create(
            "Brazil Santos",
            roaster.Id,
            OriginType.SingleOrigin,
            [brazil],
            null,
            null,
            RoastProfile.Espresso,
            null,
            null,
            1000m,
            null);
        await Insert(bean);

        var brewer = Brewer.Create("Kalita");
        var grinder = Grinder.Create("C40");
        await Insert(brewer);
        await Insert(grinder);

        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 15m, null, null, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 19m, 310m, null, 16m, null, null, null, null, DateTime.UtcNow)
        ]);

        var query = new GetCountryMapStatsQuery();

        // Act
        var result = await Send(query);

        // Assert
        var brazilStats = result.Single(entry => entry.CountryId == brazil.Id);
        brazilStats.BeanCount.Should().Be(1);
        brazilStats.TotalBagWeightGrams.Should().Be(1000m);
        brazilStats.TotalBrews.Should().Be(2);
        brazilStats.AvgBrewRating.Should().BeNull();
    }
}
