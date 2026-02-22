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

        return await query
            .OrderBy(entity => entity.Name)
            .Select(entity => new RecipeSummaryDto(
                entity.Id,
                entity.Name,
                entity.Brewer.Name,
                entity.Description))
            .ToListAsync(cancellationToken);
    }
}
