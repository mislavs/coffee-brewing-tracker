using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Queries;

public sealed record GetQuickLogUsageQuery(Guid BeanId) : IRequest<QuickLogUsageDto>;

public sealed class GetQuickLogUsageHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetQuickLogUsageQuery, QuickLogUsageDto>
{
    private const int UsageWindowDays = 90;

    public async Task<QuickLogUsageDto> Handle(
        GetQuickLogUsageQuery request,
        CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var windowStart = utcNow.AddDays(-UsageWindowDays);
        var recentBrews = dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry =>
                entry.BeanId == request.BeanId &&
                entry.BrewedAt >= windowStart &&
                entry.BrewedAt <= utcNow);

        var brewerUsage = await recentBrews
            .GroupBy(entry => entry.BrewerId)
            .Select(group => new QuickLogUsageCountDto(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var recipeUsage = await recentBrews
            .Where(entry => entry.RecipeId.HasValue)
            .GroupBy(entry => entry.RecipeId!.Value)
            .Select(group => new QuickLogUsageCountDto(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        return new QuickLogUsageDto(brewerUsage, recipeUsage);
    }
}
