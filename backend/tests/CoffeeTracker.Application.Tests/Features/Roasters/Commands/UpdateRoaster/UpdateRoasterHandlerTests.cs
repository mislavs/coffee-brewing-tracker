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
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var command = new UpdateRoasterCommand(
            roaster.Id,
            "Kawa Roasters",
            "Krakow",
            null,
            "https://kawaroasters.example.com");

        // Act
        await Send(command);

        // Assert
        var updated = await DbContext.Roasters.AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Kawa Roasters");
        updated.City.Should().Be("Krakow");
        updated.WebsiteUrl.Should().Be("https://kawaroasters.example.com");
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.NewGuid(), "Kawa", "Warsaw", null);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
