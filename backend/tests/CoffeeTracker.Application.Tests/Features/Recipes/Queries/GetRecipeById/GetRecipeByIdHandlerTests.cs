using CoffeeTracker.Application.Features.Recipes.Queries;
using CoffeeTracker.Domain.Entities;
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
