namespace CoffeeTracker.Api.Contracts.BrewLogs;

public sealed record UpdateBrewLogRequest(
    Guid BeanId,
    Guid BrewerId,
    Guid GrinderId,
    Guid? RecipeId,
    List<Guid>? AccessoryIds,
    decimal Dose,
    decimal WaterAmount,
    decimal? WaterTemperature,
    decimal? GrindSize,
    int? BrewTimeSeconds,
    int? Rating,
    string? Notes,
    string? AdjustmentIdeas,
    DateTime BrewedAt);
