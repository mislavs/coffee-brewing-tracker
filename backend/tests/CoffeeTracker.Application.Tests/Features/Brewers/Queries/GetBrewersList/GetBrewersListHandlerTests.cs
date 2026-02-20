using System.Threading.Tasks;
using CoffeeTracker.Application.Features.Brewers.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Queries.GetBrewersList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBrewersListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewersExist_ReturnsOrderedList()
    {
        // Arrange
        var brewers = new[]
        {
            Brewer.Create("Zulu Brewers"),
            Brewer.Create("Alpha Brewers"),
            Brewer.Create("Beta Brewers")
        };
        await InsertMany(brewers);
        var query = new GetBrewersListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Brewers", "Beta Brewers", "Zulu Brewers");
    }

    [Fact]
    public async Task Handle_WhenNoBrewers_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetBrewersListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().BeEmpty();
    }
}
