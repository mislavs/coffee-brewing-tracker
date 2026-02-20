using CoffeeTracker.Application.Features.Accessories.Dtos;

namespace CoffeeTracker.Application.Features.Brewers.Dtos;

public sealed record BrewerDto(Guid Id, string Name, IReadOnlyList<AccessorySummaryDto> Accessories);
