using CoffeeTracker.Application.Features.Recipes.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Recipes.Queries;

public sealed record GetRecipesListQuery(Guid? BrewerId) : IRequest<IReadOnlyList<RecipeSummaryDto>>;

public sealed class GetRecipesListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRecipesListQuery, IReadOnlyList<RecipeSummaryDto>>
{
    public async Task<IReadOnlyList<RecipeSummaryDto>> Handle(
        GetRecipesListQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Recipes
            .AsNoTracking()
            .AsQueryable();

        if (request.BrewerId.HasValue)
        {
            query = query.Where(entity => entity.BrewerId == request.BrewerId.Value);
        }

        var recipes = await query
            .OrderBy(entity => entity.Name)
            .Select(entity => new
            {
                entity.Id,
                entity.Name,
                BrewerName = entity.Brewer.Name,
                entity.Description
            })
            .ToListAsync(cancellationToken);

        var recipeIds = recipes.Select(recipe => recipe.Id).ToList();
        if (recipeIds.Count == 0)
        {
            return [];
        }

        var grindStatsRows = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.RecipeId.HasValue && recipeIds.Contains(entry.RecipeId.Value))
            .Where(entry => entry.GrindSize != null)
            .Select(entry => new
            {
                RecipeId = entry.RecipeId!.Value,
                entry.GrinderId,
                GrinderName = entry.Grinder.Name,
                GrindSize = entry.GrindSize!.Value
            })
            .ToListAsync(cancellationToken);

        var grindStatsByRecipe = grindStatsRows
            .GroupBy(entry => entry.RecipeId)
            .ToDictionary(
                recipeGroup => recipeGroup.Key,
                recipeGroup => recipeGroup
                    .GroupBy(entry => new
                    {
                        entry.GrinderId,
                        entry.GrinderName
                    })
                    .Select(grinderGroup => new RecipeGrindStatsDto(
                        grinderGroup.Key.GrinderId,
                        grinderGroup.Key.GrinderName,
                        Math.Round(grinderGroup.Average(entry => entry.GrindSize), 2),
                        grinderGroup.Count()))
                    .OrderBy(stat => stat.GrinderName)
                    .ToList());

        return recipes
            .Select(recipe => new RecipeSummaryDto(
                recipe.Id,
                recipe.Name,
                recipe.BrewerName,
                recipe.Description,
                grindStatsByRecipe.GetValueOrDefault(recipe.Id, [])))
            .ToList();
    }
}
