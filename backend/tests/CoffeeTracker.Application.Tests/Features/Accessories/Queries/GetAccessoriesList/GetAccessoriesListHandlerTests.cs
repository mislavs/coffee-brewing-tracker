using CoffeeTracker.Application.Features.Accessories.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Accessories.Queries.GetAccessoriesList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetAccessoriesListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenAccessoriesExist_ReturnsOrderedList()
    {
        // Arrange
        var accessories = new[]
        {
            Accessory.Create("Zulu Accessory"),
            Accessory.Create("Alpha Accessory"),
            Accessory.Create("Beta Accessory")
        };
        await InsertMany(accessories);
        var query = new GetAccessoriesListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("Alpha Accessory", "Beta Accessory", "Zulu Accessory");
    }

    [Fact]
    public async Task Handle_WhenNoAccessories_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetAccessoriesListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().BeEmpty();
    }
}
