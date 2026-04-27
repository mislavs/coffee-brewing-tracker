using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.SetBrewLogRating;

[Collection(nameof(IntegrationTestsCollection))]
public class SetBrewLogRatingHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewLogExists_SetsRating()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("set-rating");
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
            null,
            "Initial notes",
            "Initial ideas",
            DateTime.UtcNow);
        await Insert(brewLogEntry);

        var command = new SetBrewLogRatingCommand(brewLogEntry.Id, 5);

        // Act
        await Send(command);

        // Assert
        var updatedBrewLogEntry = await DbContext.BrewLogEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == brewLogEntry.Id,
                TestContext.Current.CancellationToken);

        updatedBrewLogEntry.Should().NotBeNull();
        updatedBrewLogEntry!.Rating.Should().Be(BrewRating.Excellent);
    }

    [Fact]
    public async Task Handle_WhenBrewLogDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new SetBrewLogRatingCommand(Guid.NewGuid(), 4);

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
