using CoffeeTracker.Application.Features.Recipes.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Commands.UpdateRecipe;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateRecipeHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRecipeExists_UpdatesRecipe()
    {
        // Arrange
        var brewerA = Brewer.Create("V60");
        var brewerB = Brewer.Create("Aeropress");
        await InsertMany([brewerA, brewerB]);

        var recipe = Recipe.Create("Old Recipe", brewerA.Id, "Old description");
        await Insert(recipe);

        var command = new UpdateRecipeCommand(
            recipe.Id,
            "Updated Recipe",
            brewerB.Id,
            "Updated description");

        // Act
        await Send(command);

        // Assert
        var updatedRecipe = await DbContext.Recipes
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == recipe.Id,
                TestContext.Current.CancellationToken);

        updatedRecipe.Should().NotBeNull();
        updatedRecipe!.Name.Should().Be("Updated Recipe");
        updatedRecipe.BrewerId.Should().Be(brewerB.Id);
        updatedRecipe.Description.Should().Be("Updated description");
    }

    [Fact]
    public async Task Handle_WhenRecipeDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateRecipeCommand(
            Guid.NewGuid(),
            "Updated Recipe",
            Guid.NewGuid(),
            "Updated description");

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
