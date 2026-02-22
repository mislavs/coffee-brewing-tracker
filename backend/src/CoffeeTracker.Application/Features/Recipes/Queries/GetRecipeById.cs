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
            .Select(entity => new RecipeDto(
                entity.Id,
                entity.Name,
                entity.Brewer.Name,
                entity.BrewerId,
                entity.Description))
            .FirstOrDefaultAsync(cancellationToken);

        return recipe ?? throw new NotFoundException($"Recipe '{request.Id}' was not found.");
    }
}
