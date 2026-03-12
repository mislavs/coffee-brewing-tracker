namespace CoffeeTracker.Application.Features.Grinders.Dtos;

public sealed record GrinderDto(
    Guid Id,
    string Name,
    int TotalBrews,
    decimal TotalCoffeeGround,
    decimal? GrindSettingMin,
    decimal? GrindSettingMax,
    IReadOnlyList<GrinderRecipeStatsDto> RecipeStats);
