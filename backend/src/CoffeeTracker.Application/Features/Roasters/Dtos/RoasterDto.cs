namespace CoffeeTracker.Application.Features.Roasters.Dtos;

public sealed record RoasterDto(
    Guid Id,
    string Name,
    string? City,
    string? Country,
    IReadOnlyList<RoasterBeanSummaryDto> Beans,
    int BeanCount,
    decimal? AvgPricePerKg,
    decimal TotalPurchasedWeightGrams,
    string? TopRoastProfile,
    int BrewCount,
    decimal? AvgBrewRating,
    bool HasLogo,
    string? LogoUrl);

public sealed record RoasterBeanSummaryDto(Guid Id, string Name);
