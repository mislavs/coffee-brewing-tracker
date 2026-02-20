using CoffeeTracker.Application.Features.Accessories.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Accessories.Queries;

public sealed record GetAccessoriesListQuery : IRequest<IReadOnlyList<AccessorySummaryDto>>;

public sealed class GetAccessoriesListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetAccessoriesListQuery, IReadOnlyList<AccessorySummaryDto>>
{
    public async Task<IReadOnlyList<AccessorySummaryDto>> Handle(
        GetAccessoriesListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Accessories
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new AccessorySummaryDto(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);
    }
}
