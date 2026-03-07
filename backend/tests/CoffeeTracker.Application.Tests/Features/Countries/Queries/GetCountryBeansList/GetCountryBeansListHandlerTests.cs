using CoffeeTracker.Application.Features.Countries.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Countries.Queries.GetCountryBeansList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetCountryBeansListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCountryHasBeans_ReturnsBeanSummariesOrderedByName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var ethiopia = Country.Create("Ethiopia", string.Empty, string.Empty);
        await Insert(roaster);
        await InsertMany([kenya, ethiopia]);

        var beans = new[]
        {
            Bean.Create("Zulu Bean", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 30m),
            Bean.Create("Alpha Bean", roaster.Id, OriginType.SingleOrigin, [kenya], null, null, RoastProfile.Filter, null, null, 250m, 40m),
            Bean.Create("Ethiopia Bean", roaster.Id, OriginType.SingleOrigin, [ethiopia], null, null, RoastProfile.Filter, null, null, 250m, 35m)
        };
        await InsertMany(beans);
        var query = new GetCountryBeansListQuery(kenya.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(2);
        result.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Bean", "Zulu Bean");
    }

    [Fact]
    public async Task Handle_WhenCountryDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetCountryBeansListQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
