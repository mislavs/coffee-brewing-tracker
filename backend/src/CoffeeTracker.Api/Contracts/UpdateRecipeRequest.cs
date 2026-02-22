namespace CoffeeTracker.Api.Contracts;

public sealed record UpdateRecipeRequest(string Name, Guid BrewerId, string? Description);
