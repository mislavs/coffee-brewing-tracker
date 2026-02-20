using CoffeeTracker.Application.Features.Brewers.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Commands.UpdateBrewer;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateBrewerHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewerExists_UpdatesBrewer()
    {
        // Arrange
        var brewer = Brewer.Create("Kawa");
        await Insert(brewer);
        var command = new UpdateBrewerCommand(brewer.Id, "Kawa Brewers");

        // Act
        await Send(command);

        // Assert
        var updated = await DbContext.Brewers.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == brewer.Id);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Kawa Brewers");
    }

    [Fact]
    public async Task Handle_WhenBrewerNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateBrewerCommand(Guid.NewGuid(), "Kawa Brewers");

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
