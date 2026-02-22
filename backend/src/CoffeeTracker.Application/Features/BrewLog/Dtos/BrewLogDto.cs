namespace CoffeeTracker.Application.Features.BrewLog.Dtos;

public sealed record BrewLogDto(
    Guid Id,
    Guid BeanId,
    string BeanName,
    Guid BrewerId,
    string BrewerName,
    Guid GrinderId,
    string GrinderName,
    Guid? RecipeId,
    string? RecipeName,
    List<BrewLogAccessoryDto> Accessories,
    decimal Dose,
    decimal WaterAmount,
    decimal? WaterTemperature,
    string? GrindSize,
    int? BrewTimeSeconds,
    int? Rating,
    string? Notes,
    string? AdjustmentIdeas,
    DateTime BrewedAt,
    decimal? BrewRatio);

public sealed record BrewLogAccessoryDto(Guid Id, string Name);
