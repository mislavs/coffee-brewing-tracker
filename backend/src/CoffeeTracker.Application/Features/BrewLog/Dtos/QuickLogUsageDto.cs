namespace CoffeeTracker.Application.Features.BrewLog.Dtos;

public sealed record QuickLogUsageDto(
    IReadOnlyList<QuickLogUsageCountDto> Brewers,
    IReadOnlyList<QuickLogUsageCountDto> Recipes);

public sealed record QuickLogUsageCountDto(Guid Id, int UsageCount);
