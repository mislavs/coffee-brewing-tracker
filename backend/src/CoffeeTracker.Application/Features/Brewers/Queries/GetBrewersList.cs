using CoffeeTracker.Application.Features.Brewers.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Brewers.Queries;

public sealed record GetBrewersListQuery : IRequest<IReadOnlyList<BrewerSummaryDto>>;

public sealed class GetBrewersListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBrewersListQuery, IReadOnlyList<BrewerSummaryDto>>
{
    public async Task<IReadOnlyList<BrewerSummaryDto>> Handle(
        GetBrewersListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Brewers
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new BrewerSummaryDto(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);
    }
}
