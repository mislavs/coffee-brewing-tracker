namespace CoffeeTracker.Application.Features.Stats.Dtos;

public sealed record DashboardStatsDto(
    int TotalBrews,
    decimal CoffeeAvailableGrams,
    int BeansExplored,
    decimal TotalCoffeeConsumedGrams);
