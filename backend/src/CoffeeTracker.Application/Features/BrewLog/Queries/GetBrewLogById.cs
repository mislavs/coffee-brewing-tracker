using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Queries;

public sealed record GetBrewLogByIdQuery(Guid Id) : IRequest<BrewLogDto>;

public sealed class GetBrewLogByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBrewLogByIdQuery, BrewLogDto>
{
    public async Task<BrewLogDto> Handle(GetBrewLogByIdQuery request, CancellationToken cancellationToken)
    {
        var brewLogEntry = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Include(entity => entity.Bean)
            .Include(entity => entity.Brewer)
            .Include(entity => entity.Grinder)
            .Include(entity => entity.Recipe)
            .Include(entity => entity.Accessories)
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new BrewLogDto(
                entity.Id,
                entity.BeanId,
                entity.Bean.Name,
                entity.BrewerId,
                entity.Brewer.Name,
                entity.GrinderId,
                entity.Grinder.Name,
                entity.RecipeId,
                entity.Recipe != null ? entity.Recipe.Name : null,
                entity.Accessories
                    .OrderBy(accessory => accessory.Name)
                    .Select(accessory => new BrewLogAccessoryDto(accessory.Id, accessory.Name))
                    .ToList(),
                entity.Dose,
                entity.WaterAmount,
                entity.WaterTemperature,
                entity.GrindSize,
                entity.BrewTimeSeconds,
                entity.Rating.HasValue ? (int?)entity.Rating.Value : null,
                entity.Notes,
                entity.AdjustmentIdeas,
                entity.BrewedAt,
                entity.Dose > 0m && entity.WaterAmount > 0m
                    ? entity.WaterAmount / entity.Dose
                    : null))
            .FirstOrDefaultAsync(cancellationToken);

        return brewLogEntry ?? throw new NotFoundException($"Brew log '{request.Id}' was not found.");
    }
}
