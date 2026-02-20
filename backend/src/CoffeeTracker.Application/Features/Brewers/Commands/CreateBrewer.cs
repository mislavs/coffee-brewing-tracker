using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;

namespace CoffeeTracker.Application.Features.Brewers.Commands;

public sealed record CreateBrewerCommand(string Name) : IRequest<Guid>;

public sealed class CreateBrewerValidator : AbstractValidator<CreateBrewerCommand>
{
    public CreateBrewerValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class CreateBrewerHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateBrewerCommand, Guid>
{
    public async Task<Guid> Handle(CreateBrewerCommand request, CancellationToken cancellationToken)
    {
        var brewer = Brewer.Create(request.Name);
        dbContext.Brewers.Add(brewer);
        await dbContext.SaveChangesAsync(cancellationToken);
        return brewer.Id;
    }
}
