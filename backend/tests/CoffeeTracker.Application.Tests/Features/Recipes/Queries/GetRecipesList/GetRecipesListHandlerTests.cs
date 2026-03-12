using CoffeeTracker.Application.Features.Recipes.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Queries.GetRecipesList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRecipesListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRecipesExist_ReturnsAllOrderedByName()
    {
        // Arrange
        var brewerA = Brewer.Create("V60");
        var brewerB = Brewer.Create("Aeropress");
        await InsertMany([brewerA, brewerB]);

        var recipes = new[]
        {
            Recipe.Create("Zulu Recipe", brewerA.Id, "Recipe Z"),
            Recipe.Create("Alpha Recipe", brewerB.Id, "Recipe A"),
            Recipe.Create("Beta Recipe", brewerA.Id, "Recipe B")
        };
        await InsertMany(recipes);

        var query = new GetRecipesListQuery(null);

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("Alpha Recipe", "Beta Recipe", "Zulu Recipe");
        result.Should().OnlyContain(entity => entity.GrindStats.Count == 0);
    }

    [Fact]
    public async Task Handle_WhenBrewerIdProvided_FiltersRecipesByBrewer()
    {
        // Arrange
        var brewerA = Brewer.Create("V60");
        var brewerB = Brewer.Create("Aeropress");
        await InsertMany([brewerA, brewerB]);

        await InsertMany(
        [
            Recipe.Create("V60 Daily", brewerA.Id, "V60 recipe"),
            Recipe.Create("V60 Fast", brewerA.Id, "Another V60 recipe"),
            Recipe.Create("Aero Daily", brewerB.Id, "Aeropress recipe")
        ]);

        var query = new GetRecipesListQuery(brewerA.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(entity => entity.BrewerName == "V60");
        result.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("V60 Daily", "V60 Fast");
        result.Should().OnlyContain(entity => entity.GrindStats.Count == 0);
    }

    [Fact]
    public async Task Handle_WhenNoRecipesMatchFilter_ReturnsEmptyList()
    {
        // Arrange
        var brewer = Brewer.Create("V60");
        await Insert(brewer);
        await Insert(Recipe.Create("V60 Daily", brewer.Id, "V60 recipe"));

        var query = new GetRecipesListQuery(Guid.NewGuid());

        // Act
        var result = await Send(query);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenRecipesHaveBrews_ReturnsAverageGrindSizePerGrinder()
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

        var dailyRecipe = Recipe.Create("Daily V60", brewer.Id, null);
        var weekendRecipe = Recipe.Create("Weekend V60", brewer.Id, null);
        await InsertMany([dailyRecipe, weekendRecipe]);

        await InsertMany<BrewLogEntry>(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, dailyRecipe.Id, 18m, 300m, null, 20m, null, null, null, null, DateTime.UtcNow.AddDays(-8)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, dailyRecipe.Id, 18m, 300m, null, 20m, null, null, null, null, DateTime.UtcNow.AddDays(-7)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, dailyRecipe.Id, 18m, 300m, null, 21m, null, null, null, null, DateTime.UtcNow.AddDays(-6)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, dailyRecipe.Id, 18m, 300m, null, 8.5m, null, null, null, null, DateTime.UtcNow.AddDays(-5)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, dailyRecipe.Id, 18m, 300m, null, 8.5m, null, null, null, null, DateTime.UtcNow.AddDays(-4)),
            BrewLogEntry.Create(bean.Id, brewer.Id, kultra.Id, dailyRecipe.Id, 18m, 300m, null, 8.0m, null, null, null, null, DateTime.UtcNow.AddDays(-3)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, weekendRecipe.Id, 18m, 300m, null, 16m, null, null, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, weekendRecipe.Id, 18m, 300m, null, 16m, null, null, null, null, DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(bean.Id, brewer.Id, comandante.Id, weekendRecipe.Id, 18m, 300m, null, null, null, null, null, null, DateTime.UtcNow)
        ]);

        var query = new GetRecipesListQuery(null);

        // Act
        var result = await Send(query);

        // Assert
        var dailyResult = result.Single(entity => entity.Id == dailyRecipe.Id);
        dailyResult.GrindStats.Should().HaveCount(2);
        var dailyComandante = dailyResult.GrindStats.Single(stat => stat.GrinderId == comandante.Id);
        dailyComandante.GrinderName.Should().Be("Comandante");
        dailyComandante.AverageGrindSize.Should().Be(20.33m);
        dailyComandante.BrewCount.Should().Be(3);

        var dailyKultra = dailyResult.GrindStats.Single(stat => stat.GrinderId == kultra.Id);
        dailyKultra.GrinderName.Should().Be("K-Ultra");
        dailyKultra.AverageGrindSize.Should().Be(8.33m);
        dailyKultra.BrewCount.Should().Be(3);

        var weekendResult = result.Single(entity => entity.Id == weekendRecipe.Id);
        weekendResult.GrindStats.Should().HaveCount(1);
        var weekendComandante = weekendResult.GrindStats.Single();
        weekendComandante.GrinderId.Should().Be(comandante.Id);
        weekendComandante.AverageGrindSize.Should().Be(16m);
        weekendComandante.BrewCount.Should().Be(2);
    }
}
