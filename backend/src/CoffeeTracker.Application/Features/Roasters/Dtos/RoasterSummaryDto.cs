namespace CoffeeTracker.Application.Features.Roasters.Dtos;

public sealed record RoasterSummaryDto(
    Guid Id,
    string Name,
    string? City,
    Guid? CountryId,
    string? CountryName,
    string? WebsiteUrl,
    int BeanCount,
    decimal? AvgPricePerKg,
    bool HasLogo,
    string? LogoUrl);
