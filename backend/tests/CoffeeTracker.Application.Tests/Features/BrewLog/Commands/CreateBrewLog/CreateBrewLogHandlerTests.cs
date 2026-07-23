using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.CreateBrewLog;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateBrewLogHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesBrewLogEntry()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("create");
        var command = new CreateBrewLogCommand(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            null,
            18m,
            300m,
            93m,
            10m,
            180,
            4,
            "Sweet and balanced",
            "Try shorter bloom",
            DateTime.UtcNow);

        // Act
        var brewLogResult = await Send(command);

        // Assert
        var brewLogEntry = await DbContext.BrewLogEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == brewLogResult.Id,
                TestContext.Current.CancellationToken);

        brewLogEntry.Should().NotBeNull();
        brewLogEntry!.BeanId.Should().Be(bean.Id);
        brewLogEntry.BrewerId.Should().Be(brewer.Id);
        brewLogEntry.GrinderId.Should().Be(grinder.Id);
        brewLogEntry.Dose.Should().Be(18m);
        brewLogEntry.WaterAmount.Should().Be(300m);
        brewLogEntry.Rating.Should().Be(BrewRating.Good);
        brewLogEntry.Notes.Should().Be("Sweet and balanced");
    }

    [Fact]
    public async Task Handle_WhenRecipeBelongsToDifferentBrewer_ThrowsConflictException()
    {
        // Arrange
        var (bean, brewerA, grinder) = await SeedRequiredEntities("recipe-mismatch");
        var brewerB = Brewer.Create("Other Brewer");
        await Insert(brewerB);
        var recipe = Recipe.Create("Other Recipe", brewerB.Id, "Recipe tied to different brewer.");
        await Insert(recipe);

        var command = new CreateBrewLogCommand(
            bean.Id,
            brewerA.Id,
            grinder.Id,
            recipe.Id,
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
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task Handle_WhenAccessoryIdsProvided_PersistsManyToManyRelationship()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("accessories");
        var accessories = new[]
        {
            Accessory.Create("Scale"),
            Accessory.Create("Thermometer")
        };
        await InsertMany(accessories);

        var command = new CreateBrewLogCommand(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            [accessories[0].Id, accessories[1].Id],
            20m,
            320m,
            null,
            9m,
            null,
            5,
            "Clean cup",
            null,
            DateTime.UtcNow);

        // Act
        var brewLogResult = await Send(command);

        // Assert
        var brewLogEntry = await DbContext.BrewLogEntries
            .AsNoTracking()
            .Include(entity => entity.Accessories)
            .FirstOrDefaultAsync(
                entity => entity.Id == brewLogResult.Id,
                TestContext.Current.CancellationToken);

        brewLogEntry.Should().NotBeNull();
        brewLogEntry!.Accessories.Should().HaveCount(2);
        brewLogEntry.Accessories.Select(entity => entity.Name)
            .Should()
            .Contain(["Scale", "Thermometer"]);
    }

    [Fact]
    public async Task Handle_WhenDoseExceedsBagWeight_ReturnsZeroRemainingBeanQuantity()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("over-brew");
        var command = new CreateBrewLogCommand(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            null,
            300m,
            300m,
            93m,
            10m,
            180,
            4,
            "Over brewed",
            null,
            DateTime.UtcNow);

        // Act
        var brewLogResult = await Send(command);

        // Assert
        brewLogResult.RemainingBeanQuantity.Should().Be(0m);
    }

    [Fact]
    public async Task Handle_WhenNewBrewHasHighestRating_IncludesItInBeanSuggestion()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("suggestion");
        await Insert(BrewLogEntry.Create(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            18m,
            300m,
            null,
            null,
            null,
            BrewRating.Good,
            null,
            null,
            DateTime.UtcNow.AddDays(-1)));
        var command = new CreateBrewLogCommand(
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            null,
            18m,
            300m,
            null,
            null,
            null,
            5,
            null,
            null,
            DateTime.UtcNow);

        // Act
        await Send(command);
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.SuggestedRating.Should().Be(5);
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
