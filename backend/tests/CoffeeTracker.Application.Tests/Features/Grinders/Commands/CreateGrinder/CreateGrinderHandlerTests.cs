using CoffeeTracker.Application.Features.Grinders.Commands;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Commands.CreateGrinder;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateGrinderHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesGrinder()
    {
        // Arrange
        var command = new CreateGrinderCommand("Kawa Grinders");

        // Act
        var grinderId = await Send(command);

        // Assert
        var grinder = await DbContext.Grinders.FirstOrDefaultAsync(
            entity => entity.Id == grinderId,
            TestContext.Current.CancellationToken);
        grinder.Should().NotBeNull();
        grinder!.Name.Should().Be("Kawa Grinders");
    }
}
