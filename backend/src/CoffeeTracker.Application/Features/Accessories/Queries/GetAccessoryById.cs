using CoffeeTracker.Application.Features.Accessories.Dtos;
using CoffeeTracker.Application.Features.Brewers.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Accessories.Queries;

public sealed record GetAccessoryByIdQuery(Guid Id) : IRequest<AccessoryDto>;

public sealed class GetAccessoryByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetAccessoryByIdQuery, AccessoryDto>
{
    public async Task<AccessoryDto> Handle(GetAccessoryByIdQuery request, CancellationToken cancellationToken)
    {
        var accessory = await dbContext.Accessories
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new AccessoryDto(
                entity.Id,
                entity.Name,
                entity.CompatibleBrewers
                    .OrderBy(brewer => brewer.Name)
                    .Select(brewer => new BrewerSummaryDto(brewer.Id, brewer.Name))
                    .ToList()))
            .FirstOrDefaultAsync(cancellationToken);

        return accessory ?? throw new NotFoundException($"Accessory '{request.Id}' was not found.");
    }
}
