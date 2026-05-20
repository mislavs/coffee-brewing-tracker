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
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();

        var overBrewedBean = CreateBean("Over brewed bean", roaster.Id, 250m);
        var fullBean = CreateBean("Full bean", roaster.Id, 500m);
        await InsertMany([overBrewedBean, fullBean]);

        await Insert(
            CreateBrewLogEntry(
                overBrewedBean.Id,
                brewer.Id,
                grinder.Id,
                300m,
                DateTime.UtcNow));

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.TotalBrews.Should().Be(1);
        result.BeansExplored.Should().Be(1);
        result.TotalCoffeeConsumedGrams.Should().Be(300m);
        result.CoffeeAvailableGrams.Should().Be(500m);
        result.EstimatedDaysRemaining.Should().BeNull();
        result.AverageDailyConsumptionGrams.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenBeanIsUnavailable_ExcludesItFromAvailableCoffee()
    {
        // Arrange
        var (roaster, _, _) = await CreateBrewDependenciesAsync();
        var availableBean = CreateBean("Available bean", roaster.Id, 500m);
        var unavailableBean = CreateBean("Unavailable bean", roaster.Id, 750m);
        unavailableBean.SetAvailability(false);
        await InsertMany([availableBean, unavailableBean]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(500m);
    }

    [Fact]
    public async Task Handle_WhenEnoughRecentBrewsExist_ReturnsEstimatedDaysRemaining()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Forecast bean", roaster.Id, 950m);
        var unavailableBean = CreateBean("Unavailable forecast bean", roaster.Id, 900m);
        unavailableBean.SetAvailability(false);
        await InsertMany([bean, unavailableBean]);
        var referenceTime = DateTime.UtcNow.AddHours(1);

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-10)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-40)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-50))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(500m);
        result.TotalCoffeeConsumedGrams.Should().Be(450m);
        result.EstimatedDaysRemaining.Should().Be(55);
        result.AverageDailyConsumptionGrams.Should().Be(9m);
    }

    [Fact]
    public async Task Handle_WhenTooFewRecentBrewsExist_HidesEstimatedDaysRemaining()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Sparse bean", roaster.Id, 500m);
        await Insert(bean);

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, DateTime.UtcNow.AddDays(-10)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, DateTime.UtcNow.AddDays(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, DateTime.UtcNow.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 18m, DateTime.UtcNow.AddDays(-40))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.EstimatedDaysRemaining.Should().BeNull();
        result.AverageDailyConsumptionGrams.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenNoCoffeeIsAvailable_ReturnsZeroEstimatedDaysRemaining()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Empty bean", roaster.Id, 450m);
        await Insert(bean);
        var referenceTime = DateTime.UtcNow.AddHours(1);

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-10)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-40)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-50))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(0m);
        result.EstimatedDaysRemaining.Should().Be(0);
        result.AverageDailyConsumptionGrams.Should().Be(9m);
    }

    [Fact]
    public async Task Handle_WhenFirstRecentBrewAlmostFillsWindow_DividesConsumptionByNinetyDays()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Full window bean", roaster.Id, 950m);
        await Insert(bean);
        var referenceTime = DateTime.UtcNow;

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-89).AddHours(-1)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-70)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-50)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-10))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(500m);
        result.EstimatedDaysRemaining.Should().Be(100);
        result.AverageDailyConsumptionGrams.Should().Be(5m);
    }

    [Fact]
    public async Task Handle_WhenFirstRecentBrewIsThirtyDaysAgo_DividesConsumptionByThirtyDays()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Short history bean", roaster.Id, 950m);
        await Insert(bean);
        var referenceTime = DateTime.UtcNow.AddHours(1);

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-15)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-10)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-5))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(500m);
        result.EstimatedDaysRemaining.Should().Be(33);
        result.AverageDailyConsumptionGrams.Should().Be(15m);
    }

    [Fact]
    public async Task Handle_WhenAllRecentBrewsAreToday_DividesConsumptionByOneDay()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Same day bean", roaster.Id, 950m);
        await Insert(bean);
        var referenceTime = DateTime.UtcNow;

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddMinutes(-50)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddMinutes(-40)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddMinutes(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddMinutes(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddMinutes(-10))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(500m);
        result.EstimatedDaysRemaining.Should().Be(1);
        result.AverageDailyConsumptionGrams.Should().Be(450m);
    }

    [Fact]
    public async Task Handle_WhenOlderBrewsExist_ExcludesThemFromAverageDailyConsumption()
    {
        // Arrange
        var (roaster, brewer, grinder) = await CreateBrewDependenciesAsync();
        var bean = CreateBean("Old history bean", roaster.Id, 990m);
        await Insert(bean);
        var referenceTime = DateTime.UtcNow.AddHours(1);

        await InsertMany(
        [
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-120)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-30)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-20)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-15)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-10)),
            CreateBrewLogEntry(bean.Id, brewer.Id, grinder.Id, 90m, referenceTime.AddDays(-5))
        ]);

        // Act
        var result = await Send(new GetDashboardStatsQuery());

        // Assert
        result.CoffeeAvailableGrams.Should().Be(450m);
        result.TotalCoffeeConsumedGrams.Should().Be(540m);
        result.EstimatedDaysRemaining.Should().Be(30);
        result.AverageDailyConsumptionGrams.Should().Be(15m);
    }

    private async Task<(Roaster Roaster, Brewer Brewer, Grinder Grinder)> CreateBrewDependenciesAsync()
    {
        var roaster = Roaster.Create("Roaster dashboard", null, null);
        var brewer = Brewer.Create("V60");
        var grinder = Grinder.Create("K-Ultra");

        await Insert(roaster);
        await Insert(brewer);
        await Insert(grinder);

        return (roaster, brewer, grinder);
    }

    private static Bean CreateBean(string name, Guid roasterId, decimal bagWeight) =>
        Bean.Create(
            name,
            roasterId,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            bagWeight,
            null);

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
}
