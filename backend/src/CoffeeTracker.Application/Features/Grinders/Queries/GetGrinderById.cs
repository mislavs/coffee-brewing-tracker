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
            .Select(entity => new { entity.Id, entity.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (grinder is null)
        {
            throw new NotFoundException($"Grinder '{request.Id}' was not found.");
        }

        var brewStats = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entity => entity.GrinderId == request.Id)
            .Select(entity => new
            {
                entity.Dose,
                entity.GrindSize,
                entity.RecipeId,
                RecipeName = entity.Recipe != null ? entity.Recipe.Name : null
            })
            .ToListAsync(cancellationToken);

        var totalBrews = brewStats.Count;
        var totalCoffeeGround = brewStats.Sum(entity => entity.Dose);

        var grindSettings = brewStats
            .Where(entity => entity.GrindSize.HasValue)
            .Select(entity => entity.GrindSize!.Value)
            .ToList();

        decimal? grindSettingMin = grindSettings.Count == 0
            ? null
            : grindSettings.Min();

        decimal? grindSettingMax = grindSettings.Count == 0
            ? null
            : grindSettings.Max();

        var recipeStats = brewStats
            .Where(entity => entity.RecipeId.HasValue && entity.GrindSize.HasValue && entity.RecipeName is not null)
            .GroupBy(entity => new
            {
                RecipeId = entity.RecipeId!.Value,
                RecipeName = entity.RecipeName!
            })
            .Select(group => new GrinderRecipeStatsDto(
                group.Key.RecipeId,
                group.Key.RecipeName,
                Math.Round(group.Average(entity => entity.GrindSize!.Value), 2),
                group.Count()))
            .OrderBy(stat => stat.RecipeName)
            .ToList();

        return new GrinderDto(
            grinder.Id,
            grinder.Name,
            totalBrews,
            totalCoffeeGround,
            grindSettingMin,
            grindSettingMax,
            recipeStats);
    }
}
