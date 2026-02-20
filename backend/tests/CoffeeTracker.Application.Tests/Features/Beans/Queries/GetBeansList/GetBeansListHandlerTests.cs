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
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
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
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
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
}
