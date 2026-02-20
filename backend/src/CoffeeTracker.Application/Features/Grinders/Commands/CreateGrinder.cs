using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;

namespace CoffeeTracker.Application.Features.Grinders.Commands;

public sealed record CreateGrinderCommand(string Name) : IRequest<Guid>;

public sealed class CreateGrinderValidator : AbstractValidator<CreateGrinderCommand>
{
    public CreateGrinderValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class CreateGrinderHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateGrinderCommand, Guid>
{
    public async Task<Guid> Handle(CreateGrinderCommand request, CancellationToken cancellationToken)
    {
        var grinder = Grinder.Create(request.Name);
        dbContext.Grinders.Add(grinder);
        await dbContext.SaveChangesAsync(cancellationToken);
        return grinder.Id;
    }
}
