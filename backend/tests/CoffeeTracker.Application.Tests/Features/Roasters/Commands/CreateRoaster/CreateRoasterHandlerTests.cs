using CoffeeTracker.Application.Features.Roasters.Commands;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.CreateRoaster;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateRoasterHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesRoaster()
    {
        // Arrange
        var command = new CreateRoasterCommand("Kawa", "Warsaw", "Poland");

        // Act
        var roasterId = await Send(command);

        // Assert
        var roaster = await DbContext.Roasters.FirstOrDefaultAsync(entity => entity.Id == roasterId);
        roaster.Should().NotBeNull();
        roaster!.Name.Should().Be("Kawa");
        roaster.City.Should().Be("Warsaw");
        roaster.Country.Should().Be("Poland");
    }
}
