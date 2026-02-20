using CoffeeTracker.Application.Features.Grinders.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Grinders.Queries;

public sealed record GetGrinderByIdQuery(Guid Id) : IRequest<GrinderDto>;

public sealed class GetGrinderByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetGrinderByIdQuery, GrinderDto>
{
    public async Task<GrinderDto> Handle(GetGrinderByIdQuery request, CancellationToken cancellationToken)
    {
        var grinder = await dbContext.Grinders
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new GrinderDto(
                entity.Id,
                entity.Name))
            .FirstOrDefaultAsync(cancellationToken);

        return grinder ?? throw new NotFoundException($"Grinder '{request.Id}' was not found.");
    }
}
