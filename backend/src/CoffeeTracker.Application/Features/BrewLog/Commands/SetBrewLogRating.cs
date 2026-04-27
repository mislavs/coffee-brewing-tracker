using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Commands;

public sealed record SetBrewLogRatingCommand(Guid Id, int? Rating) : IRequest;

public sealed class SetBrewLogRatingValidator : AbstractValidator<SetBrewLogRatingCommand>
{
    public SetBrewLogRatingValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Rating)
            .InclusiveBetween(1, 5)
            .When(command => command.Rating.HasValue);
    }
}

public sealed class SetBrewLogRatingHandler(ApplicationDbContext dbContext)
    : IRequestHandler<SetBrewLogRatingCommand>
{
    public async Task Handle(SetBrewLogRatingCommand request, CancellationToken cancellationToken)
    {
        var brewLogEntry = await dbContext.BrewLogEntries
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (brewLogEntry is null)
        {
            throw new NotFoundException($"Brew log '{request.Id}' was not found.");
        }

        var rating = request.Rating.HasValue ? (BrewRating?)request.Rating.Value : null;
        brewLogEntry.SetRating(rating);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
