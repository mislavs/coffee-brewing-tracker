using CoffeeTracker.Application.Features.Brewers.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Queries.GetBrewerById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBrewerByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewerExists_ReturnsBrewerDto()
    {
        // Arrange
        var brewer = Brewer.Create("Kawa Brewers");
        await Insert(brewer);
        var query = new GetBrewerByIdQuery(brewer.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(brewer.Id);
        result.Name.Should().Be("Kawa Brewers");
        result.Accessories.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenBrewerNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetBrewerByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
