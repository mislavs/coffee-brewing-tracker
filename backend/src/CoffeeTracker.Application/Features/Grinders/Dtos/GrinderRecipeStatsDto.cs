namespace CoffeeTracker.Application.Features.Grinders.Dtos;

public sealed record GrinderRecipeStatsDto(
    Guid RecipeId,
    string RecipeName,
    decimal AverageGrindSize,
    int BrewCount);
