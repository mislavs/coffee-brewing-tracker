using CoffeeTracker.Application.Features.Countries.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Countries.Queries.GetCountriesList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetCountriesListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCountriesExist_ReturnsOrderedByName()
    {
        // Arrange
        var countries = new[]
        {
            Country.Create("Kenya"),
            Country.Create("Brazil"),
            Country.Create("Ethiopia")
        };
        await InsertMany(countries);
        var query = new GetCountriesListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Brazil", "Ethiopia", "Kenya");
    }
}
