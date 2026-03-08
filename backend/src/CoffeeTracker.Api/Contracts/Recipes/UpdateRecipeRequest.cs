namespace CoffeeTracker.Api.Contracts.Recipes;

public sealed record UpdateRecipeRequest(string Name, Guid BrewerId, string? Description);
