namespace CoffeeTracker.Application.Features.Recipes.Dtos;

public sealed record RecipeGrindStatsDto(
    Guid GrinderId,
    string GrinderName,
    string MostCommonGrindSize,
    int UsageCount);
