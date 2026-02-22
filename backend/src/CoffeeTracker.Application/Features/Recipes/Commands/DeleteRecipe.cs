using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Recipes.Commands;

public sealed record DeleteRecipeCommand(Guid Id) : IRequest;

public sealed class DeleteRecipeValidator : AbstractValidator<DeleteRecipeCommand>
{
    public DeleteRecipeValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}

public sealed class DeleteRecipeHandler(ApplicationDbContext dbContext)
    : IRequestHandler<DeleteRecipeCommand>
{
    public async Task Handle(DeleteRecipeCommand request, CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{request.Id}' was not found.");
        }

        dbContext.Recipes.Remove(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
