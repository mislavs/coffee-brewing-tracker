using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Commands;

public sealed record DeleteBrewLogCommand(Guid Id) : IRequest;

public sealed class DeleteBrewLogValidator : AbstractValidator<DeleteBrewLogCommand>
{
    public DeleteBrewLogValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}

public sealed class DeleteBrewLogHandler(ApplicationDbContext dbContext)
    : IRequestHandler<DeleteBrewLogCommand>
{
    public async Task Handle(DeleteBrewLogCommand request, CancellationToken cancellationToken)
    {
        var brewLogEntry = await dbContext.BrewLogEntries
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (brewLogEntry is null)
        {
            throw new NotFoundException($"Brew log '{request.Id}' was not found.");
        }

        dbContext.BrewLogEntries.Remove(brewLogEntry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
