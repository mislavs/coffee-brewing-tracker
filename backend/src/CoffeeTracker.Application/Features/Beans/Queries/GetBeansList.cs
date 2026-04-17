using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public sealed record GetBeansListQuery(
    string? Search,
    bool IncludeUnavailable = false,
    Guid? CountryId = null) : IRequest<IReadOnlyList<BeanSummaryDto>>;

public sealed class GetBeansListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBeansListQuery, IReadOnlyList<BeanSummaryDto>>
{
    public async Task<IReadOnlyList<BeanSummaryDto>> Handle(
        GetBeansListQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Beans
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim();
            query = query.Where(entity => EF.Functions.ILike(entity.Name, $"%{searchTerm}%"));
        }

        if (!request.IncludeUnavailable)
        {
            query = query.Where(entity => entity.IsAvailable);
        }

        if (request.CountryId.HasValue)
        {
            query = query.Where(entity =>
                entity.OriginCountries.Any(country => country.Id == request.CountryId.Value));
        }

        var beans = await query
            .OrderBy(entity => entity.Name)
            .Select(BeanSummaryProjection.ToData(dbContext))
            .ToListAsync(cancellationToken);

        return beans
            .Select(BeanSummaryProjection.ToDto)
            .ToList();
    }
}
