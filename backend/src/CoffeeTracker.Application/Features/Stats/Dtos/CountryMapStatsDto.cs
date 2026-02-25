namespace CoffeeTracker.Application.Features.Stats.Dtos;

public sealed record CountryMapStatsDto(
    Guid CountryId,
    string CountryName,
    string IsoAlpha2,
    string IsoNumericCode,
    int BeanCount,
    decimal TotalBagWeightGrams,
    decimal? AvgBrewRating,
    int TotalBrews);
