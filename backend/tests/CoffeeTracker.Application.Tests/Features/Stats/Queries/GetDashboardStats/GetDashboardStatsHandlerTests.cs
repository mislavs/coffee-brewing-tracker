using CoffeeTracker.Application.Features.Stats.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Stats.Queries.GetDashboardStats;

[Collection(nameof(IntegrationTestsCollection))]
public class GetDashboardStatsHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanIsOverBrewed_ClampsAvailableCoffeePerBeanBeforeSumming()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster dashboard", null, null);
        await Insert(roaster);

        var overBrewedBean = Bean.Create(
            "Over brewed bean",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
        var fullBean = Bean.Create(
            "Full bean",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            500m,
            null);
        await InsertMany([overBrewedBean, fullBean]);

        var brewer = Brewer.Create("V60");
        var grinder = Grinder.Create("K-Ultra");
        await Insert(brewer);
        await Insert(grinder);

        await Insert(
            BrewLogEntry.Create(
                overBrewedBean.Id,
                brewer.Id,
                grinder.Id,
                null,
                300m,
                300m,
                null,
                10m,
                null,
                BrewRating.Good,
                null,
                null,
                DateTime.UtcNow));

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.TotalBrews.Should().Be(1);
        result.BeansExplored.Should().Be(1);
        result.TotalCoffeeConsumedGrams.Should().Be(300m);
        result.CoffeeAvailableGrams.Should().Be(500m);
    }
}
