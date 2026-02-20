using CoffeeTracker.Application.Features.Grinders.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Queries.GetGrinderById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetGrinderByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenGrinderExists_ReturnsGrinderDto()
    {
        // Arrange
        var grinder = Grinder.Create("Kawa Grinders");
        await Insert(grinder);
        var query = new GetGrinderByIdQuery(grinder.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(grinder.Id);
        result.Name.Should().Be("Kawa Grinders");
    }

    [Fact]
    public async Task Handle_WhenGrinderNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetGrinderByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
