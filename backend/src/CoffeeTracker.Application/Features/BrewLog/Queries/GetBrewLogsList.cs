using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Queries;

public sealed record GetBrewLogsListQuery(
    string? Search,
    DateTime? DateFrom,
    DateTime? DateTo,
    bool IncludeUnavailableBeans = false)
    : IRequest<IReadOnlyList<BrewLogSummaryDto>>;

public sealed class GetBrewLogsListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBrewLogsListQuery, IReadOnlyList<BrewLogSummaryDto>>
{
    public async Task<IReadOnlyList<BrewLogSummaryDto>> Handle(
        GetBrewLogsListQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.BrewLogEntries
            .AsNoTracking()
            .AsQueryable();

        if (!request.IncludeUnavailableBeans)
        {
            query = query.Where(entity => entity.Bean.IsAvailable);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim();
            query = query.Where(entity => EF.Functions.ILike(entity.Bean.Name, $"%{searchTerm}%"));
        }

        if (request.DateFrom.HasValue)
        {
            query = query.Where(entity => entity.BrewedAt >= request.DateFrom.Value);
        }

        if (request.DateTo.HasValue)
        {
            query = query.Where(entity => entity.BrewedAt <= request.DateTo.Value);
        }

        return await query
            .OrderByDescending(entity => entity.BrewedAt)
            .Select(entity => new BrewLogSummaryDto(
                entity.Id,
                entity.BrewedAt,
                entity.Bean.Name,
                entity.Bean.Roaster.Name,
                entity.Brewer.Name,
                entity.Recipe != null ? entity.Recipe.Name : null,
                entity.Dose,
                entity.WaterAmount,
                entity.Grinder.Name,
                entity.GrindSize,
                entity.BrewTimeSeconds,
                entity.Rating.HasValue ? (int?)entity.Rating.Value : null,
                entity.Bean.Price.HasValue && entity.Bean.BagWeight > 0m
                    ? entity.Dose * entity.Bean.Price.Value / entity.Bean.BagWeight
                    : null))
            .ToListAsync(cancellationToken);
    }
}
