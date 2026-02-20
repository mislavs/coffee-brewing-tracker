using CoffeeTracker.Application.Features.Grinders.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Queries.GetGrindersList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetGrindersListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenGrindersExist_ReturnsOrderedList()
    {
        // Arrange
        var grinders = new[]
        {
            Grinder.Create("Zulu Grinders"),
            Grinder.Create("Alpha Grinders"),
            Grinder.Create("Beta Grinders")
        };
        await InsertMany(grinders);
        var query = new GetGrindersListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Grinders", "Beta Grinders", "Zulu Grinders");
    }

    [Fact]
    public async Task Handle_WhenNoGrinders_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetGrindersListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().BeEmpty();
    }
}
