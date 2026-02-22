using CoffeeTracker.Application.Features.Recipes.Commands;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Commands.CreateRecipe;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateRecipeHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesRecipe()
    {
        // Arrange
        var brewer = Brewer.Create("V60");
        await Insert(brewer);
        var command = new CreateRecipeCommand("Daily V60", brewer.Id, "Simple 1:16 recipe.");

        // Act
        var recipeId = await Send(command);

        // Assert
        var recipe = await DbContext.Recipes
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == recipeId);

        recipe.Should().NotBeNull();
        recipe!.Name.Should().Be("Daily V60");
        recipe.BrewerId.Should().Be(brewer.Id);
        recipe.Description.Should().Be("Simple 1:16 recipe.");
    }
}
