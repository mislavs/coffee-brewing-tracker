using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.DeleteBrewLog;

[Collection(nameof(IntegrationTestsCollection))]
public class DeleteBrewLogHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewLogExists_DeletesBrewLogEntry()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster delete", null, null);
        await Insert(roaster);
        var bean = Bean.Create(
            "Bean delete",
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
        var brewer = Brewer.Create("Brewer delete");
        var grinder = Grinder.Create("Grinder delete");
        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        var brewLogEntry = BrewLogEntry.Create(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            18m,
            300m,
            null,
            "10clicks",
            null,
            BrewRating.Good,
            "Notes",
            null,
            DateTime.UtcNow);
        await Insert(brewLogEntry);

        var command = new DeleteBrewLogCommand(brewLogEntry.Id);

        // Act
        await Send(command);

        // Assert
        var deletedBrewLogEntry = await DbContext.BrewLogEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == brewLogEntry.Id,
                TestContext.Current.CancellationToken);

        deletedBrewLogEntry.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenBrewLogDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new DeleteBrewLogCommand(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
