using CoffeeTracker.Application.Features.Accessories.Commands;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Accessories.Commands.CreateAccessory;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateAccessoryHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesAccessory()
    {
        // Arrange
        var command = new CreateAccessoryCommand("Paper Filters", null);

        // Act
        var accessoryId = await Send(command);

        // Assert
        var accessory = await DbContext.Accessories
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == accessoryId,
                TestContext.Current.CancellationToken);

        accessory.Should().NotBeNull();
        accessory!.Name.Should().Be("Paper Filters");
    }

    [Fact]
    public async Task Handle_WhenBrewerIdsProvided_AssociatesBrewers()
    {
        // Arrange
        var brewers = new[] { Brewer.Create("V60"), Brewer.Create("Chemex") };
        await InsertMany(brewers);
        var command = new CreateAccessoryCommand("Paper Filters", brewers.Select(entity => entity.Id).ToList());

        // Act
        var accessoryId = await Send(command);

        // Assert
        var accessory = await DbContext.Accessories
            .AsNoTracking()
            .Include(entity => entity.CompatibleBrewers)
            .FirstOrDefaultAsync(
                entity => entity.Id == accessoryId,
                TestContext.Current.CancellationToken);

        accessory.Should().NotBeNull();
        accessory!.CompatibleBrewers.Select(entity => entity.Name)
            .Should()
            .Contain(["V60", "Chemex"]);
    }
}
