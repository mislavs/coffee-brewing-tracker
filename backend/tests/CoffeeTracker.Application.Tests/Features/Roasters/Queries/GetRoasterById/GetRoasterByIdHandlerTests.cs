using CoffeeTracker.Application.Features.Roasters.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Queries.GetRoasterById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRoasterByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoasterExists_ReturnsRoasterDetails()
    {
        // Arrange
        var country = Country.Create("Poland", string.Empty, string.Empty);
        await Insert(country);
        var roaster = Roaster.Create("Kawa", "Warsaw", country.Id);
        await Insert(roaster);
        var query = new GetRoasterByIdQuery(roaster.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(roaster.Id);
        result.Name.Should().Be("Kawa");
        result.City.Should().Be("Warsaw");
        result.CountryId.Should().Be(country.Id);
        result.CountryName.Should().Be("Poland");
        result.Beans.Should().BeEmpty();
        result.BeanCount.Should().Be(0);
        result.AvgPricePerKg.Should().BeNull();
        result.TotalPurchasedWeightGrams.Should().Be(0);
        result.TopRoastProfile.Should().BeNull();
        result.BrewCount.Should().Be(0);
        result.AvgBrewRating.Should().BeNull();
        result.HasLogo.Should().BeFalse();
        result.LogoUrl.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRoasterHasBeans_ReturnsBeanSummariesAndStats()
    {
        // Arrange
        var country = Country.Create("Poland", string.Empty, string.Empty);
        await Insert(country);
        var roaster = Roaster.Create("Kawa", "Warsaw", country.Id);
        await Insert(roaster);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var ethiopia = Country.Create("Ethiopia", string.Empty, string.Empty);
        await InsertMany([kenya, ethiopia]);

        var beanA = Bean.Create(
            "Zulu Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        var beanB = Bean.Create(
            "Alpha Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            [ethiopia],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        var beanC = Bean.Create(
            "Middle Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            [ethiopia],
            null,
            null,
            RoastProfile.Espresso,
            null,
            null,
            300m,
            60m);
        await InsertMany([beanA, beanB]);
        await Insert(beanC);

        var grinder = Grinder.Create("K Plus");
        var brewer = Brewer.Create("V60");
        await Insert(grinder);
        await Insert(brewer);

        await InsertMany(
        [
            BrewLogEntry.Create(beanA.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, "10", null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(beanB.Id, brewer.Id, grinder.Id, null, 19m, 320m, null, "11", null, BrewRating.Excellent, null, null, DateTime.UtcNow.AddDays(-1))
        ]);

        var query = new GetRoasterByIdQuery(roaster.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Beans.Should().HaveCount(3);
        result.Beans.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Bean", "Middle Bean", "Zulu Bean");
        result.BeanCount.Should().Be(3);
        result.AvgPricePerKg.Should().BeApproximately(173.333m, 0.001m);
        result.TotalPurchasedWeightGrams.Should().Be(800m);
        result.TopRoastProfile.Should().Be("Filter");
        result.BrewCount.Should().Be(2);
        result.AvgBrewRating.Should().Be(4.5m);
        result.HasLogo.Should().BeFalse();
        result.LogoUrl.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetRoasterByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
