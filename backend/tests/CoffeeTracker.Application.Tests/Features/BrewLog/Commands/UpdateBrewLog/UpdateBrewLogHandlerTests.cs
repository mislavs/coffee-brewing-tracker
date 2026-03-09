using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.UpdateBrewLog;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateBrewLogHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewLogExists_UpdatesFieldsAndAccessories()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("update");
        var initialAccessory = Accessory.Create("Scale");
        var updatedAccessory = Accessory.Create("Stirrer");
        await InsertMany([initialAccessory, updatedAccessory]);

        var brewLogEntry = BrewLogEntry.Create(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            18m,
            300m,
            93m,
            10m,
            180,
            BrewRating.Good,
            "Initial notes",
            "Initial ideas",
            DateTime.UtcNow.AddDays(-1));
        brewLogEntry.SetAccessories([initialAccessory]);
        await Insert(brewLogEntry);

        var command = new UpdateBrewLogCommand(
            brewLogEntry.Id,
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            [updatedAccessory.Id],
            20m,
            320m,
            94m,
            9m,
            190,
            5,
            "Updated notes",
            "Updated ideas",
            DateTime.UtcNow);

        // Act
        await Send(command);

        // Assert
        var updatedBrewLogEntry = await DbContext.BrewLogEntries
            .AsNoTracking()
            .Include(entity => entity.Accessories)
            .FirstOrDefaultAsync(
                entity => entity.Id == brewLogEntry.Id,
                TestContext.Current.CancellationToken);

        updatedBrewLogEntry.Should().NotBeNull();
        updatedBrewLogEntry!.Dose.Should().Be(20m);
        updatedBrewLogEntry.WaterAmount.Should().Be(320m);
        updatedBrewLogEntry.GrindSize.Should().Be(9m);
        updatedBrewLogEntry.Rating.Should().Be(BrewRating.Excellent);
        updatedBrewLogEntry.Notes.Should().Be("Updated notes");
        updatedBrewLogEntry.AdjustmentIdeas.Should().Be("Updated ideas");
        updatedBrewLogEntry.Accessories.Should().ContainSingle();
        updatedBrewLogEntry.Accessories.Single().Id.Should().Be(updatedAccessory.Id);
    }

    [Fact]
    public async Task Handle_WhenBrewLogDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateBrewLogCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            null,
            18m,
            300m,
            null,
            10m,
            null,
            4,
            null,
            null,
            DateTime.UtcNow);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    private async Task<(Bean Bean, Brewer Brewer, Grinder Grinder)> SeedRequiredEntities(string suffix)
    {
        var roaster = Roaster.Create($"Roaster {suffix}", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            $"Bean {suffix}",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
        var brewer = Brewer.Create($"Brewer {suffix}");
        var grinder = Grinder.Create($"Grinder {suffix}");

        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        return (bean, brewer, grinder);
    }
}
