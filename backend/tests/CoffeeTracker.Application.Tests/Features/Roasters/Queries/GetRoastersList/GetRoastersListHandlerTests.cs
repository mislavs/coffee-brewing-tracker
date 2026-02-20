using CoffeeTracker.Application.Features.Roasters.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Queries.GetRoastersList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRoastersListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoastersExist_ReturnsOrderedByName()
    {
        // Arrange
        var roasters = new[]
        {
            Roaster.Create("Zulu Roasters", "City 1", "Country 1"),
            Roaster.Create("Alpha Roasters", "City 2", "Country 2"),
            Roaster.Create("Beta Roasters", "City 3", "Country 3")
        };
        await InsertMany(roasters);
        var query = new GetRoastersListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Roasters", "Beta Roasters", "Zulu Roasters");
    }
}
