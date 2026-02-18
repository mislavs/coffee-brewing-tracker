using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Queries;

public sealed record GetRoasterByIdQuery(Guid Id) : IRequest<RoasterDto>;

public sealed class GetRoasterByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRoasterByIdQuery, RoasterDto>
{
    public async Task<RoasterDto> Handle(GetRoasterByIdQuery request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new RoasterDto(
                entity.Id,
                entity.Name,
                entity.City,
                entity.Country))
            .FirstOrDefaultAsync(cancellationToken);

        return roaster ?? throw new NotFoundException($"Roaster '{request.Id}' was not found.");
    }
}
