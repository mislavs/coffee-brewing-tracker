namespace CoffeeTracker.Application.Features.Recipes.Dtos;

public sealed record RecipeSummaryDto(
    Guid Id,
    string Name,
    string BrewerName,
    string? Description,
    IReadOnlyList<RecipeGrindStatsDto> GrindStats);
