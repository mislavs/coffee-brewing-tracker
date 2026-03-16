using CoffeeTracker.Application.Common;
using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Queries;

public sealed record GetBrewLogsListQuery(
    string? Search,
    Guid? BeanId,
    DateTime? DateFrom,
    DateTime? DateTo,
    bool IncludeUnavailableBeans = false,
    int Page = 1,
    int PageSize = 12)
    : IRequest<PaginatedList<BrewLogSummaryDto>>;

public sealed class GetBrewLogsListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBrewLogsListQuery, PaginatedList<BrewLogSummaryDto>>
{
    public async Task<PaginatedList<BrewLogSummaryDto>> Handle(
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

        if (request.BeanId.HasValue)
        {
            query = query.Where(entity => entity.BeanId == request.BeanId.Value);
        }

        if (request.DateFrom.HasValue)
        {
            query = query.Where(entity => entity.BrewedAt >= request.DateFrom.Value);
        }

        if (request.DateTo.HasValue)
        {
            query = query.Where(entity => entity.BrewedAt <= request.DateTo.Value);
        }

        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Max(request.PageSize, 1);
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(entity => entity.BrewedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return new PaginatedList<BrewLogSummaryDto>(items, page, pageSize, totalCount);
    }
}
