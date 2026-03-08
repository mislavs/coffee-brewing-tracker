namespace CoffeeTracker.Api.Contracts.Recipes;

public sealed record CreateRecipeRequest(string Name, Guid BrewerId, string? Description);
