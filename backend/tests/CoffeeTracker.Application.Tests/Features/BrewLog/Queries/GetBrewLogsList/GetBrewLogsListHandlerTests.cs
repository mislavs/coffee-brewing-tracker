using CoffeeTracker.Application.Features.BrewLog.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Queries.GetBrewLogsList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBrewLogsListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewLogsExist_ReturnsEntriesOrderedByBrewedAtDescending()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("ordering");
        var brewLogs = new[]
        {
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Average, null, null, DateTime.UtcNow),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Excellent, null, null, DateTime.UtcNow.AddDays(-1))
        };
        await InsertMany(brewLogs);

        var query = new GetBrewLogsListQuery(null, null, null, null, null);

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items.Select(entry => entry.BrewedAt)
            .Should()
            .BeInDescendingOrder();
        result.TotalCount.Should().Be(3);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(12);
    }

    [Fact]
    public async Task Handle_WhenBeanHasPrice_ReturnsBeanCostPerCup()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster cost", null, null);
        await Insert(roaster);
        var bean = Bean.Create(
            "Bean cost",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            20m);
        var brewer = Brewer.Create("Brewer cost");
        var grinder = Grinder.Create("Grinder cost");
        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        await Insert(BrewLogEntry.Create(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            18m,
            300m,
            null,
            10m,
            null,
            BrewRating.Good,
            null,
            null,
            DateTime.UtcNow));

        var query = new GetBrewLogsListQuery(null, null, null, null, null);

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.Single().BeanCostPerCup.Should().Be(1.44m);
    }

    [Fact]
    public async Task Handle_WhenSearchProvided_FiltersByBeanNameCaseInsensitive()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster search", null, null);
        await Insert(roaster);
        var brewer = Brewer.Create("V60");
        var grinder = Grinder.Create("Comandante");
        await Insert(brewer);
        await Insert(grinder);

        var kenyaBean = Bean.Create(
            "Kenya AB",
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
        var ethiopiaBean = Bean.Create(
            "Ethiopia Guji",
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
        await InsertMany([kenyaBean, ethiopiaBean]);

        await InsertMany(
        [
            BrewLogEntry.Create(kenyaBean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow),
            BrewLogEntry.Create(ethiopiaBean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow)
        ]);

        var query = new GetBrewLogsListQuery("KENYA", null, null, null, null);

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.Single().BeanName.Should().Be("Kenya AB");
    }

    [Fact]
    public async Task Handle_WhenDateRangeProvided_FiltersByDateFromAndDateTo()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("date");
        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, new DateTime(2026, 2, 1, 10, 0, 0, DateTimeKind.Utc)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, new DateTime(2026, 2, 10, 10, 0, 0, DateTimeKind.Utc)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, new DateTime(2026, 2, 20, 10, 0, 0, DateTimeKind.Utc))
        ]);

        var query = new GetBrewLogsListQuery(
            null,
            null,
            null,
            new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 2, 15, 23, 59, 59, DateTimeKind.Utc));

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.Single().BrewedAt.Should().Be(new DateTime(2026, 2, 10, 10, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public async Task Handle_WhenRecipeIdProvided_FiltersByRecipe()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("recipe");
        var matchingRecipe = Recipe.Create("Matching recipe", brewer.Id, null);
        var otherRecipe = Recipe.Create("Other recipe", brewer.Id, null);
        await InsertMany([matchingRecipe, otherRecipe]);

        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, matchingRecipe.Id, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, otherRecipe.Id, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-2))
        ]);

        var query = new GetBrewLogsListQuery(null, null, matchingRecipe.Id, null, null);

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.Single().RecipeName.Should().Be("Matching recipe");
        result.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_WhenBeanIsUnavailable_ExcludesItByDefaultAndIncludesItWhenRequested()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster availability", null, null);
        await Insert(roaster);
        var brewer = Brewer.Create("Brewer availability");
        var grinder = Grinder.Create("Grinder availability");
        await Insert(brewer);
        await Insert(grinder);

        var availableBean = Bean.Create(
            "Available Bean",
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
        var unavailableBean = Bean.Create(
            "Unavailable Bean",
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
        unavailableBean.SetAvailability(false);
        await InsertMany([availableBean, unavailableBean]);

        await InsertMany(
        [
            BrewLogEntry.Create(availableBean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(unavailableBean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 12m, null, BrewRating.Good, null, null, DateTime.UtcNow)
        ]);

        // Act
        var defaultResult = await Send(new GetBrewLogsListQuery(null, null, null, null, null));
        var includeUnavailableResult = await Send(new GetBrewLogsListQuery(null, null, null, null, null, true));

        // Assert
        defaultResult.Items.Should().ContainSingle();
        defaultResult.Items.Single().BeanName.Should().Be("Available Bean");

        includeUnavailableResult.Items.Should().HaveCount(2);
        includeUnavailableResult.Items.Select(entry => entry.BeanName)
            .Should()
            .Contain(["Available Bean", "Unavailable Bean"]);
    }

    [Fact]
    public async Task Handle_WhenPageAndPageSizeProvided_ReturnsRequestedPageWithPaginationMetadata()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("pagination");
        var brewedAt = new DateTime(2026, 4, 10, 12, 30, 45, DateTimeKind.Utc);
        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, brewedAt),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, brewedAt.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, brewedAt.AddDays(-2))
        ]);

        var query = new GetBrewLogsListQuery(null, null, null, null, null, false, 2, 1);

        // Act
        var result = await Send(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.Single().BrewedAt.Should().Be(brewedAt.AddDays(-1));
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(1);
        result.TotalCount.Should().Be(3);
        result.TotalPages.Should().Be(3);
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeTrue();
    }

    private async Task<(Bean Bean, Brewer Brewer, Grinder Grinder)> SeedRequiredEntities(string suffix)
    {
        var roaster = Roaster.Create($"Roaster {suffix}", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            $"Bean {suffix}",
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
        var brewer = Brewer.Create($"Brewer {suffix}");
        var grinder = Grinder.Create($"Grinder {suffix}");

        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        return (bean, brewer, grinder);
    }
}
