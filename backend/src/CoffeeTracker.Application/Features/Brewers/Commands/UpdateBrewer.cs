using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Brewers.Commands;

public sealed record UpdateBrewerCommand(Guid Id, string Name) : IRequest;

public sealed class UpdateBrewerValidator : AbstractValidator<UpdateBrewerCommand>
{
    public UpdateBrewerValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class UpdateBrewerHandler(ApplicationDbContext dbContext) : IRequestHandler<UpdateBrewerCommand>
{
    public async Task Handle(UpdateBrewerCommand request, CancellationToken cancellationToken)
    {
        var brewer = await dbContext.Brewers
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (brewer is null)
        {
            throw new NotFoundException($"Brewer '{request.Id}' was not found.");
        }

        brewer.Update(request.Name);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
