using CoffeeTracker.Application.Features.Recipes.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Queries.GetRecipeById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRecipeByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRecipeExists_ReturnsRecipeWithBrewerName()
    {
        // Arrange
        var brewer = Brewer.Create("V60");
        await Insert(brewer);
        var recipe = Recipe.Create("Daily V60", brewer.Id, "Simple recipe.");
        await Insert(recipe);
        var query = new GetRecipeByIdQuery(recipe.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(recipe.Id);
        result.Name.Should().Be("Daily V60");
        result.BrewerId.Should().Be(brewer.Id);
        result.BrewerName.Should().Be("V60");
        result.Description.Should().Be("Simple recipe.");
        result.GrindStats.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenRecipeHasBrewsAcrossGrinders_ReturnsMostCommonGrindSizePerGrinder()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            "Bean",
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
        await Insert(bean);

        var brewer = Brewer.Create("V60");
        var comandante = Grinder.Create("Comandante");
        var kultra = Grinder.Create("K-Ultra");
        await Insert(brewer);
        await Insert(comandante);
        await Insert(kultra);

        var recipe = Recipe.Create("Daily V60", brewer.Id, null);
        var ignoredRecipe = Recipe.Create("Ignored recipe", brewer.Id, null);
        await InsertMany([recipe, ignoredRecipe]);

        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, recipe.Id, 18m, 300m, null, "20", null, null, null, null, DateTime.UtcNow.AddDays(-6)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, recipe.Id, 18m, 300m, null, "20", null, null, null, null, DateTime.UtcNow.AddDays(-5)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, recipe.Id, 18m, 300m, null, "21", null, null, null, null, DateTime.UtcNow.AddDays(-4)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, recipe.Id, 18m, 300m, null, "8.0", null, null, null, null, DateTime.UtcNow.AddDays(-3)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, recipe.Id, 18m, 300m, null, "8.0", null, null, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, recipe.Id, 18m, 300m, null, "8.5", null, null, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, ignoredRecipe.Id, 18m, 300m, null, "14", null, null, null, null, DateTime.UtcNow)
        ]);

        var query = new GetRecipeByIdQuery(recipe.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.GrindStats.Should().HaveCount(2);

        var comandanteStats = result.GrindStats.Single(entry => entry.GrinderId == comandante.Id);
        comandanteStats.GrinderName.Should().Be("Comandante");
        comandanteStats.MostCommonGrindSize.Should().Be("20");
        comandanteStats.UsageCount.Should().Be(2);

        var kultraStats = result.GrindStats.Single(entry => entry.GrinderId == kultra.Id);
        kultraStats.GrinderName.Should().Be("K-Ultra");
        kultraStats.MostCommonGrindSize.Should().Be("8.0");
        kultraStats.UsageCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WhenRecipeBrewsOnlyHaveNullGrindSize_ReturnsEmptyGrindStats()
    {
        // Arrange
        var roaster = Roaster.Create("Roaster", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            "Bean",
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
        await Insert(bean);

        var brewer = Brewer.Create("Kalita");
        var grinder = Grinder.Create("K-Ultra");
        await Insert(brewer);
        await Insert(grinder);

        var recipe = Recipe.Create("No Grind Recipe", brewer.Id, null);
        await Insert(recipe);

        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, recipe.Id, 18m, 300m, null, null, null, null, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, recipe.Id, 18m, 300m, null, null, null, null, null, null, DateTime.UtcNow)
        ]);

        var query = new GetRecipeByIdQuery(recipe.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.GrindStats.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenRecipeDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetRecipeByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
