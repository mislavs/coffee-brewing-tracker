namespace CoffeeTracker.Application.Features.BrewLog.Dtos;

public sealed record BrewLogSummaryDto(
    Guid Id,
    DateTime BrewedAt,
    string BeanName,
    string BrewerName,
    int? Rating,
    decimal? BrewRatio);
