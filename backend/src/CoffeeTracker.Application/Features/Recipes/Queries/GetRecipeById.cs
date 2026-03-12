using CoffeeTracker.Application.Features.Recipes.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Recipes.Queries;

public sealed record GetRecipeByIdQuery(Guid Id) : IRequest<RecipeDto>;

public sealed class GetRecipeByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRecipeByIdQuery, RecipeDto>
{
    public async Task<RecipeDto> Handle(GetRecipeByIdQuery request, CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new
            {
                entity.Id,
                entity.Name,
                BrewerName = entity.Brewer.Name,
                entity.BrewerId,
                entity.Description
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{request.Id}' was not found.");
        }

        var grindStatsRows = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.RecipeId == request.Id)
            .Where(entry => entry.GrindSize != null)
            .Select(entry => new
            {
                entry.GrinderId,
                GrinderName = entry.Grinder.Name,
                GrindSize = entry.GrindSize!.Value
            })
            .ToListAsync(cancellationToken);

        var grindStats = grindStatsRows
            .GroupBy(
                entry => new
                {
                    entry.GrinderId,
                    entry.GrinderName
                })
            .Select(group => new RecipeGrindStatsDto(
                group.Key.GrinderId,
                group.Key.GrinderName,
                Math.Round(group.Average(entry => entry.GrindSize), 2),
                group.Count()))
            .OrderBy(stat => stat.GrinderName)
            .ToList();

        return new RecipeDto(
            recipe.Id,
            recipe.Name,
            recipe.BrewerName,
            recipe.BrewerId,
            recipe.Description,
            grindStats);
    }
}
