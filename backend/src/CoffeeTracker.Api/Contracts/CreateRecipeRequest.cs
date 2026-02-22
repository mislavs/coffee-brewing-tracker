namespace CoffeeTracker.Api.Contracts;

public sealed record CreateRecipeRequest(string Name, Guid BrewerId, string? Description);
