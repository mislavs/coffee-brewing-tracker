using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Accessories.Commands;

public sealed record UpdateAccessoryCommand(Guid Id, string Name, List<Guid>? BrewerIds) : IRequest;

public sealed class UpdateAccessoryValidator : AbstractValidator<UpdateAccessoryCommand>
{
    public UpdateAccessoryValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class UpdateAccessoryHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UpdateAccessoryCommand>
{
    public async Task Handle(UpdateAccessoryCommand request, CancellationToken cancellationToken)
    {
        var accessory = await dbContext.Accessories
            .Include(entity => entity.CompatibleBrewers)
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (accessory is null)
        {
            throw new NotFoundException($"Accessory '{request.Id}' was not found.");
        }

        accessory.Update(request.Name);

        var brewers = request.BrewerIds is { Count: > 0 }
            ? await dbContext.Brewers
                .Where(entity => request.BrewerIds.Contains(entity.Id))
                .ToListAsync(cancellationToken)
            : [];

        accessory.SetCompatibleBrewers(brewers);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
