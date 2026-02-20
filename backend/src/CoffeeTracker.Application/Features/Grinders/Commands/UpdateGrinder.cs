using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Grinders.Commands;

public sealed record UpdateGrinderCommand(Guid Id, string Name) : IRequest;

public sealed class UpdateGrinderValidator : AbstractValidator<UpdateGrinderCommand>
{
    public UpdateGrinderValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class UpdateGrinderHandler(ApplicationDbContext dbContext) : IRequestHandler<UpdateGrinderCommand>
{
    public async Task Handle(UpdateGrinderCommand request, CancellationToken cancellationToken)
    {
        var grinder = await dbContext.Grinders
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (grinder is null)
        {
            throw new NotFoundException($"Grinder '{request.Id}' was not found.");
        }

        grinder.Update(request.Name);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
