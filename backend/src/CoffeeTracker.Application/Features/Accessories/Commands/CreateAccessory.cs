using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Accessories.Commands;

public sealed record CreateAccessoryCommand(string Name, List<Guid>? BrewerIds) : IRequest<Guid>;

public sealed class CreateAccessoryValidator : AbstractValidator<CreateAccessoryCommand>
{
    public CreateAccessoryValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}

public sealed class CreateAccessoryHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateAccessoryCommand, Guid>
{
    public async Task<Guid> Handle(CreateAccessoryCommand request, CancellationToken cancellationToken)
    {
        var accessory = Accessory.Create(request.Name);

        if (request.BrewerIds is { Count: > 0 })
        {
            var brewers = await dbContext.Brewers
                .Where(entity => request.BrewerIds.Contains(entity.Id))
                .ToListAsync(cancellationToken);

            accessory.SetCompatibleBrewers(brewers);
        }

        dbContext.Accessories.Add(accessory);
        await dbContext.SaveChangesAsync(cancellationToken);

        return accessory.Id;
    }
}
