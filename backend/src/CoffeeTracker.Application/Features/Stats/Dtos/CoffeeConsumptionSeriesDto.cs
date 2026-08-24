namespace CoffeeTracker.Application.Features.Stats.Dtos;

public enum CoffeeConsumptionGranularity
{
    Daily,
    Weekly,
    Monthly
}

public sealed record CoffeeConsumptionBucketDto(
    DateOnly StartDate,
    DateOnly EndDate,
    decimal ConsumedGrams,
    int BrewCount,
    bool IsPartial);

public sealed record CoffeeConsumptionSeriesDto(
    DateOnly From,
    DateOnly To,
    CoffeeConsumptionGranularity Granularity,
    string TimeZone,
    decimal TotalConsumedGrams,
    int TotalBrews,
    IReadOnlyList<CoffeeConsumptionBucketDto> Buckets);
