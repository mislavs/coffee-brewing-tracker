using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Stats.Queries;

public sealed record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public sealed class GetDashboardStatsHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    public async Task<DashboardStatsDto> Handle(
        GetDashboardStatsQuery request,
        CancellationToken cancellationToken)
    {
        var recentBrewWindowStart = DateTime.UtcNow.AddDays(-60);

        var totalBrews = await dbContext.BrewLogEntries
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var totalCoffeeConsumedGrams = await dbContext.BrewLogEntries
            .AsNoTracking()
            .SumAsync(entity => (decimal?)entity.Dose, cancellationToken) ?? 0m;

        var beansExplored = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Select(entity => entity.BeanId)
            .Distinct()
            .CountAsync(cancellationToken);

        var coffeeAvailableGrams = await dbContext.Beans
            .AsNoTracking()
            .Select(entity => Math.Max(0m, entity.BagWeight - (dbContext.BrewLogEntries
                .Where(entry => entry.BeanId == entity.Id)
                .Sum(entry => (decimal?)entry.Dose) ?? 0m)))
            .SumAsync(cancellationToken);

        var recentConsumptionStats = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entity => entity.BrewedAt >= recentBrewWindowStart)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                BrewCount = group.Count(),
                TotalDose = group.Sum(entity => entity.Dose)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var recentBrewCount = recentConsumptionStats?.BrewCount ?? 0;
        var recentConsumptionGrams = recentConsumptionStats?.TotalDose ?? 0m;
        int? estimatedDaysRemaining = null;
        decimal? averageDailyConsumptionGrams = null;

        if (recentBrewCount >= 5 && recentConsumptionGrams > 0m)
        {
            averageDailyConsumptionGrams = recentConsumptionGrams / 60m;
            estimatedDaysRemaining = coffeeAvailableGrams == 0m
                ? 0
                : (int)Math.Floor(coffeeAvailableGrams / averageDailyConsumptionGrams.Value);
        }

        return new DashboardStatsDto(
            totalBrews,
            coffeeAvailableGrams,
            beansExplored,
            totalCoffeeConsumedGrams,
            estimatedDaysRemaining,
            averageDailyConsumptionGrams);
    }
}
