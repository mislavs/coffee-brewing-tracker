namespace CoffeeTracker.Application.Features.Recipes.Dtos;

public sealed record RecipeDto(
    Guid Id,
    string Name,
    string BrewerName,
    Guid BrewerId,
    string? Description,
    IReadOnlyList<RecipeGrindStatsDto> GrindStats);
