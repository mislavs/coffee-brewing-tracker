using CoffeeTracker.Application.Features.Recipes.Queries;
using CoffeeTracker.Domain.Entities;
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
}
