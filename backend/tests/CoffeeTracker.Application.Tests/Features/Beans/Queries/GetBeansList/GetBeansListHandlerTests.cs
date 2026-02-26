using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Beans.Queries.GetBeansList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBeansListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeansExist_ReturnsAllOrderedByName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var brazil = Country.Create("Brazil");
        var kenya = Country.Create("Kenya");
        await InsertMany([brazil, kenya]);

        var beans = new[]
        {
            Bean.Create("Zulu Bean", roaster.Id, OriginType.Blend, [brazil], null, null, RoastProfile.Omni, null, null, 250m, 30m),
            Bean.Create("Alpha Bean", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 40m)
        };
        await InsertMany(beans);

        var query = new GetBeansListQuery(null);

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(2);
        result.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("Alpha Bean", "Zulu Bean");
    }

    [Fact]
    public async Task Handle_WhenSearchProvided_FiltersByNameCaseInsensitive()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var kenya = Country.Create("Kenya");
        var ethiopia = Country.Create("Ethiopia");
        await InsertMany([kenya, ethiopia]);

        var beans = new[]
        {
            Bean.Create("Kenya AB", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 40m),
            Bean.Create("Ethiopia Guji", roaster.Id, OriginType.SingleOrigin, [ethiopia], null, null, RoastProfile.Filter, null, null, 250m, 38m)
        };
        await InsertMany(beans);

        var query = new GetBeansListQuery("kenya");

        // Act
        var result = await Send(query);

        // Assert
        result.Should().ContainSingle();
        result.Single().Name.Should().Be("Kenya AB");
    }

    [Fact]
    public async Task Handle_WhenCountryFilterProvided_ReturnsOnlyBeansFromCountry()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var kenya = Country.Create("Kenya");
        var brazil = Country.Create("Brazil");
        await InsertMany([kenya, brazil]);

        var beans = new[]
        {
            Bean.Create("Kenya AB", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 42m),
            Bean.Create("Kenya PB", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 39m),
            Bean.Create("Brazil Santos", roaster.Id, OriginType.SingleOrigin, [brazil], null, null, RoastProfile.Filter, null, null, 250m, 36m)
        };
        await InsertMany(beans);

        var query = new GetBeansListQuery(null, false, kenya.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(2);
        result.Select(entity => entity.Name)
            .Should()
            .BeEquivalentTo(["Kenya AB", "Kenya PB"]);
    }

    [Fact]
    public async Task Handle_WhenCountrySearchAndAvailabilityFiltersCombined_AppliesAllFilters()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var kenya = Country.Create("Kenya");
        var brazil = Country.Create("Brazil");
        await InsertMany([kenya, brazil]);

        var kenyaAvailable = Bean.Create(
            "Kenya Filter Bright",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            41m);
        var kenyaUnavailable = Bean.Create(
            "Kenya Filter Classic",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            38m);
        kenyaUnavailable.SetAvailability(false);

        var kenyaDifferentName = Bean.Create(
            "Kenya Floral",
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
        var brazilSameSearch = Bean.Create(
            "Kenya Filter Brazil",
            roaster.Id,
            OriginType.SingleOrigin,
            [brazil],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            37m);
        await InsertMany([kenyaAvailable, kenyaUnavailable, kenyaDifferentName, brazilSameSearch]);

        var excludeUnavailableQuery = new GetBeansListQuery("kenya filter", false, kenya.Id);
        var includeUnavailableQuery = new GetBeansListQuery("kenya filter", true, kenya.Id);

        // Act
        var excludeUnavailableResult = await Send(excludeUnavailableQuery);
        var includeUnavailableResult = await Send(includeUnavailableQuery);

        // Assert
        excludeUnavailableResult.Should().ContainSingle();
        excludeUnavailableResult.Single().Name.Should().Be("Kenya Filter Bright");

        includeUnavailableResult.Select(entity => entity.Name)
            .Should()
            .BeEquivalentTo(["Kenya Filter Bright", "Kenya Filter Classic"]);
    }
}
