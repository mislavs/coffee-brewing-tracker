using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Application.Features.Stats.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Stats.Queries.GetCoffeeConsumption;

[Collection(nameof(IntegrationTestsCollection))]
public class GetCoffeeConsumptionHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenDailyRangeContainsGaps_ReturnsCompleteSeriesAndTotals()
    {
        // Arrange
        var (bean, brewer, grinder) = await CreateBrewDependenciesAsync();
        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, Utc(2026, 1, 1, 8)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 20m, Utc(2026, 1, 3, 9)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 22m, Utc(2026, 1, 3, 15)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 30m, Utc(2026, 1, 5, 8))
        ]);
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 1, 4),
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = await Send(query);

        // Assert
        result.TotalConsumedGrams.Should().Be(60m);
        result.TotalBrews.Should().Be(3);
        result.Buckets.Should().BeEquivalentTo(
        [
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 1), 18m, 1, false),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 2), new DateOnly(2026, 1, 2), 0m, 0, false),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 3), new DateOnly(2026, 1, 3), 42m, 2, false),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 4), new DateOnly(2026, 1, 4), 0m, 0, false)
        ], options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task Handle_WhenWeeklyRangeStartsMidweek_UsesMondayBucketsAndClipsBoundary()
    {
        // Arrange
        var (bean, brewer, grinder) = await CreateBrewDependenciesAsync();
        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 50m, Utc(2026, 1, 5, 9)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, Utc(2026, 1, 7, 9)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 20m, Utc(2026, 1, 12, 9))
        ]);
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 7),
            new DateOnly(2026, 1, 18),
            CoffeeConsumptionGranularity.Weekly,
            "UTC");

        // Act
        var result = await Send(query);

        // Assert
        result.Buckets.Should().BeEquivalentTo(
        [
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 7), new DateOnly(2026, 1, 11), 18m, 1, true),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 12), new DateOnly(2026, 1, 18), 20m, 1, false)
        ], options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task Handle_WhenMonthlyRangeCrossesMonths_ReturnsCalendarMonthBuckets()
    {
        // Arrange
        var (bean, brewer, grinder) = await CreateBrewDependenciesAsync();
        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, Utc(2026, 1, 20, 9)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 20m, Utc(2026, 2, 10, 9)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 22m, Utc(2026, 3, 5, 9))
        ]);
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 15),
            new DateOnly(2026, 3, 10),
            CoffeeConsumptionGranularity.Monthly,
            "UTC");

        // Act
        var result = await Send(query);

        // Assert
        result.Buckets.Should().BeEquivalentTo(
        [
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 1, 15), new DateOnly(2026, 1, 31), 18m, 1, true),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 2, 1), new DateOnly(2026, 2, 28), 20m, 1, false),
            new CoffeeConsumptionBucketDto(new DateOnly(2026, 3, 1), new DateOnly(2026, 3, 10), 22m, 1, true)
        ], options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task Handle_WhenBrewCrossesLocalMidnight_GroupsItInRequestedTimeZone()
    {
        // Arrange
        var (bean, brewer, grinder) = await CreateBrewDependenciesAsync();
        await Insert(CreateBrewLogEntry(
            bean.Id,
            brewer.Id,
            grinder.Id,
            18m,
            Utc(2026, 1, 1, 23, 30)));
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 2),
            new DateOnly(2026, 1, 2),
            CoffeeConsumptionGranularity.Daily,
            "Europe/Zagreb");

        // Act
        var result = await Send(query);

        // Assert
        result.TotalConsumedGrams.Should().Be(18m);
        result.TotalBrews.Should().Be(1);
        result.Buckets.Should().ContainSingle()
            .Which.ConsumedGrams.Should().Be(18m);
    }

    private async Task<(Bean Bean, Brewer Brewer, Grinder Grinder)> CreateBrewDependenciesAsync()
    {
        var roaster = Roaster.Create("Consumption roaster", null, null);
        var bean = Bean.Create(
            "Consumption bean",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            1000m,
            null);
        var brewer = Brewer.Create("Consumption brewer");
        var grinder = Grinder.Create("Consumption grinder");

        await Insert(roaster);
        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        return (bean, brewer, grinder);
    }

    private static BrewLogEntry CreateBrewLogEntry(
        Guid beanId,
        Guid brewerId,
        Guid grinderId,
        decimal dose,
        DateTime brewedAt) =>
        BrewLogEntry.Create(
            beanId,
            brewerId,
            grinderId,
            null,
            dose,
            300m,
            null,
            10m,
            null,
            BrewRating.Good,
            null,
            null,
            brewedAt);

    private static DateTime Utc(int year, int month, int day, int hour, int minute = 0) =>
        new(year, month, day, hour, minute, 0, DateTimeKind.Utc);
}
