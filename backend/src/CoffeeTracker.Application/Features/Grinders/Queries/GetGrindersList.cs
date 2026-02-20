using CoffeeTracker.Application.Features.Grinders.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Grinders.Queries;

public sealed record GetGrindersListQuery : IRequest<IReadOnlyList<GrinderSummaryDto>>;

public sealed class GetGrindersListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetGrindersListQuery, IReadOnlyList<GrinderSummaryDto>>
{
    public async Task<IReadOnlyList<GrinderSummaryDto>> Handle(
        GetGrindersListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Grinders
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new GrinderSummaryDto(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);
    }
}
