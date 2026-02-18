using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Queries;

public sealed record GetRoastersListQuery : IRequest<IReadOnlyList<RoasterSummaryDto>>;

public sealed class GetRoastersListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRoastersListQuery, IReadOnlyList<RoasterSummaryDto>>
{
    public async Task<IReadOnlyList<RoasterSummaryDto>> Handle(
        GetRoastersListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Roasters
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new RoasterSummaryDto(
                entity.Id,
                entity.Name,
                entity.City,
                entity.Country))
            .ToListAsync(cancellationToken);
    }
}
