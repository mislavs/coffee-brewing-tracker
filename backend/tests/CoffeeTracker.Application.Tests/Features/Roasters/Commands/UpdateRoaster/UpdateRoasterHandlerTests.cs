using CoffeeTracker.Application.Features.Roasters.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.UpdateRoaster;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateRoasterHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoasterExists_UpdatesRoaster()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
        await Insert(roaster);
        var command = new UpdateRoasterCommand(roaster.Id, "Kawa Roasters", "Krakow", "Poland");

        // Act
        await Send(command);

        // Assert
        var updated = await DbContext.Roasters.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == roaster.Id);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Kawa Roasters");
        updated.City.Should().Be("Krakow");
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.NewGuid(), "Kawa", "Warsaw", "Poland");

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
