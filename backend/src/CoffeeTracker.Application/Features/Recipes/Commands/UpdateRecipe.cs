using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Recipes.Commands;

public sealed record UpdateRecipeCommand(Guid Id, string Name, Guid BrewerId, string? Description) : IRequest;

public sealed class UpdateRecipeValidator : AbstractValidator<UpdateRecipeCommand>
{
    public UpdateRecipeValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.BrewerId)
            .NotEmpty();

        RuleFor(command => command.Description)
            .MaximumLength(2000);
    }
}

public sealed class UpdateRecipeHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UpdateRecipeCommand>
{
    public async Task Handle(UpdateRecipeCommand request, CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{request.Id}' was not found.");
        }

        var brewerExists = await dbContext.Brewers
            .AnyAsync(entity => entity.Id == request.BrewerId, cancellationToken);

        if (!brewerExists)
        {
            throw new NotFoundException($"Brewer '{request.BrewerId}' was not found.");
        }

        recipe.Update(request.Name, request.BrewerId, request.Description);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
