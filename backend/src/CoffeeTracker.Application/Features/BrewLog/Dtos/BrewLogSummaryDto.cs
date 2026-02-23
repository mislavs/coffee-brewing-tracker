namespace CoffeeTracker.Application.Features.BrewLog.Dtos;

public sealed record BrewLogSummaryDto(
    Guid Id,
    DateTime BrewedAt,
    string BeanName,
    string? RoasterName,
    string BrewerName,
    string? RecipeName,
    decimal Dose,
    decimal WaterAmount,
    string GrinderName,
    string? GrindSize,
    int? BrewTimeSeconds,
    int? Rating);
