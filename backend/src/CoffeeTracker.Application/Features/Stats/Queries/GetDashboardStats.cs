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

        return new DashboardStatsDto(
            totalBrews,
            coffeeAvailableGrams,
            beansExplored,
            totalCoffeeConsumedGrams);
    }
}
