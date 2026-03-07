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
            Country.Create("Kenya", string.Empty, string.Empty),
            Country.Create("Brazil", string.Empty, string.Empty),
            Country.Create("Ethiopia", string.Empty, string.Empty)
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
