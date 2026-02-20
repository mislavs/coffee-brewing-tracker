using CoffeeTracker.Application.Features.Brewers.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Brewers.Queries;

public sealed record GetBrewerByIdQuery(Guid Id) : IRequest<BrewerDto>;

public sealed class GetBrewerByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBrewerByIdQuery, BrewerDto>
{
    public async Task<BrewerDto> Handle(GetBrewerByIdQuery request, CancellationToken cancellationToken)
    {
        var brewer = await dbContext.Brewers
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new BrewerDto(entity.Id, entity.Name))
            .FirstOrDefaultAsync(cancellationToken);

        return brewer ?? throw new NotFoundException($"Brewer '{request.Id}' was not found.");
    }
}
