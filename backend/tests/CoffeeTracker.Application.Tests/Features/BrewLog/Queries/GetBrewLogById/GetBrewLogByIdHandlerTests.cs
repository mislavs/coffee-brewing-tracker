using CoffeeTracker.Application.Features.BrewLog.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Queries.GetBrewLogById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBrewLogByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBrewLogExists_ReturnsDetailedDtoWithResolvedNamesAndBrewRatio()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster query", null, null);
        await Insert(roaster);
        var bean = Bean.Create(
            "Bean query",
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
        var brewer = Brewer.Create("V60");
        var grinder = Grinder.Create("Comandante");
        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        var recipe = Recipe.Create("Daily recipe", brewer.Id, "Simple recipe.");
        var accessory = Accessory.Create("Scale");
        await Insert(recipe);
        await Insert(accessory);

        var brewLogEntry = BrewLogEntry.Create(
            bean.Id,
            brewer.Id,
            grinder.Id,
            recipe.Id,
            18m,
            300m,
            93m,
            "10clicks",
            180,
            BrewRating.Excellent,
            "Clear cup",
            "Try lower temp",
            DateTime.UtcNow);
        brewLogEntry.SetAccessories([accessory]);
        await Insert(brewLogEntry);

        var query = new GetBrewLogByIdQuery(brewLogEntry.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(brewLogEntry.Id);
        result.BeanName.Should().Be("Bean query");
        result.BrewerName.Should().Be("V60");
        result.GrinderName.Should().Be("Comandante");
        result.RecipeName.Should().Be("Daily recipe");
        result.Accessories.Should().ContainSingle(entry => entry.Name == "Scale");
        result.BrewRatio.Should().BeApproximately(16.67m, 0.01m);
        result.Rating.Should().Be(5);
        result.Notes.Should().Be("Clear cup");
    }

    [Fact]
    public async Task Handle_WhenBrewLogDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetBrewLogByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
