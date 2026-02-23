using CoffeeTracker.Application.Features.Accessories.Dtos;
using CoffeeTracker.Application.Features.Brewers.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Accessories.Queries;

public sealed record GetAccessoriesListQuery : IRequest<IReadOnlyList<AccessoryDto>>;

public sealed class GetAccessoriesListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetAccessoriesListQuery, IReadOnlyList<AccessoryDto>>
{
    public async Task<IReadOnlyList<AccessoryDto>> Handle(
        GetAccessoriesListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Accessories
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new AccessoryDto(
                entity.Id,
                entity.Name,
                entity.CompatibleBrewers
                    .OrderBy(brewer => brewer.Name)
                    .Select(brewer => new BrewerSummaryDto(brewer.Id, brewer.Name))
                    .ToList()))
            .ToListAsync(cancellationToken);
    }
}
