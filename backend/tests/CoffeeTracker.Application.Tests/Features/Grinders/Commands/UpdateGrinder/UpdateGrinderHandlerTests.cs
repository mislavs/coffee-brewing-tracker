using CoffeeTracker.Application.Features.Grinders.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Commands.UpdateGrinder;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateGrinderHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenGrinderExists_UpdatesGrinder()
    {
        // Arrange
        var grinder = Grinder.Create("Kawa");
        await Insert(grinder);
        var command = new UpdateGrinderCommand(grinder.Id, "Kawa Grinders");

        // Act
        await Send(command);

        // Assert
        var updated = await DbContext.Grinders.AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == grinder.Id,
                TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Kawa Grinders");
    }

    [Fact]
    public async Task Handle_WhenGrinderNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateGrinderCommand(Guid.NewGuid(), "Kawa Grinders");

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
