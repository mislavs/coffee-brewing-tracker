using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Recipes.Commands;

public sealed record CreateRecipeCommand(string Name, Guid BrewerId, string? Description) : IRequest<Guid>;

public sealed class CreateRecipeValidator : AbstractValidator<CreateRecipeCommand>
{
    public CreateRecipeValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.BrewerId)
            .NotEmpty();

        RuleFor(command => command.Description)
            .MaximumLength(2000);
    }
}

public sealed class CreateRecipeHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateRecipeCommand, Guid>
{
    public async Task<Guid> Handle(CreateRecipeCommand request, CancellationToken cancellationToken)
    {
        var brewerExists = await dbContext.Brewers
            .AnyAsync(entity => entity.Id == request.BrewerId, cancellationToken);

        if (!brewerExists)
        {
            throw new NotFoundException($"Brewer '{request.BrewerId}' was not found.");
        }

        var recipe = Recipe.Create(request.Name, request.BrewerId, request.Description);
        dbContext.Recipes.Add(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);

        return recipe.Id;
    }
}
