using CoffeeTracker.Application.Features.Brewers.Dtos;

namespace CoffeeTracker.Application.Features.Accessories.Dtos;

public sealed record AccessoryDto(
    Guid Id,
    string Name,
    IReadOnlyList<BrewerSummaryDto> CompatibleBrewers);
