using CoffeeTracker.Application.Features.Recipes.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Commands.DeleteRecipe;

[Collection(nameof(IntegrationTestsCollection))]
public class DeleteRecipeHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRecipeExists_DeletesRecipe()
    {
        // Arrange
        var brewer = Brewer.Create("V60");
        await Insert(brewer);
        var recipe = Recipe.Create("Daily V60", brewer.Id, "Simple recipe.");
        await Insert(recipe);
        var command = new DeleteRecipeCommand(recipe.Id);

        // Act
        await Send(command);

        // Assert
        var deletedRecipe = await DbContext.Recipes
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == recipe.Id,
                TestContext.Current.CancellationToken);

        deletedRecipe.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRecipeDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new DeleteRecipeCommand(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
