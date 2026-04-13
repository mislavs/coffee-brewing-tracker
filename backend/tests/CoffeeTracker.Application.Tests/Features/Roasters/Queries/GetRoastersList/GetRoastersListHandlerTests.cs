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
            Roaster.Create("Zulu Roasters", "City 1", null, "https://zulu.example.com"),
            Roaster.Create("Alpha Roasters", "City 2", null, "https://alpha.example.com"),
            Roaster.Create("Beta Roasters", "City 3", null, "https://beta.example.com")
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
        result.Select(entry => entry.WebsiteUrl)
            .Should()
            .ContainInOrder(
                "https://alpha.example.com",
                "https://beta.example.com",
                "https://zulu.example.com");
        result.Should().OnlyContain(entry => entry.BeanCount == 0);
        result.Should().OnlyContain(entry => entry.AvgPricePerKg == null);
        result.Should().OnlyContain(entry => !entry.HasLogo);
        result.Should().OnlyContain(entry => entry.LogoUrl == null);
    }
}
