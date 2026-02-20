using CoffeeTracker.Application.Features.Accessories.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Accessories.Commands.UpdateAccessory;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateAccessoryHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenAccessoryExists_UpdatesAccessory()
    {
        // Arrange
        var accessory = Accessory.Create("Old Filters");
        await Insert(accessory);
        var command = new UpdateAccessoryCommand(accessory.Id, "Paper Filters", null);

        // Act
        await Send(command);

        // Assert
        var updatedAccessory = await DbContext.Accessories
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == accessory.Id);

        updatedAccessory.Should().NotBeNull();
        updatedAccessory!.Name.Should().Be("Paper Filters");
    }

    [Fact]
    public async Task Handle_WhenBrewerIdsChanged_ReassociatesBrewers()
    {
        // Arrange
        var brewerA = Brewer.Create("V60");
        var brewerB = Brewer.Create("Chemex");
        var brewerC = Brewer.Create("Aeropress");
        await InsertMany([brewerA, brewerB, brewerC]);

        var accessory = Accessory.Create("Paper Filters");
        accessory.SetCompatibleBrewers([brewerA, brewerB]);
        await Insert(accessory);

        var command = new UpdateAccessoryCommand(accessory.Id, "Paper Filters", [brewerC.Id]);

        // Act
        await Send(command);

        // Assert
        var updatedAccessory = await DbContext.Accessories
            .AsNoTracking()
            .Include(entity => entity.CompatibleBrewers)
            .FirstOrDefaultAsync(entity => entity.Id == accessory.Id);

        updatedAccessory.Should().NotBeNull();
        updatedAccessory!.CompatibleBrewers.Should().ContainSingle();
        updatedAccessory.CompatibleBrewers.Single().Name.Should().Be("Aeropress");
    }

    [Fact]
    public async Task Handle_WhenAccessoryNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateAccessoryCommand(Guid.NewGuid(), "Paper Filters", null);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
