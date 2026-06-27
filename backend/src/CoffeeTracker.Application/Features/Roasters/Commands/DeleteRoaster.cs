using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record DeleteRoasterCommand(Guid Id) : IRequest;

public sealed class DeleteRoasterValidator : AbstractValidator<DeleteRoasterCommand>
{
    public DeleteRoasterValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}

public sealed class DeleteRoasterHandler(ApplicationDbContext dbContext)
    : IRequestHandler<DeleteRoasterCommand>
{
    public async Task Handle(DeleteRoasterCommand request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (roaster is null)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }

        var hasBeans = await dbContext.Beans
            .AnyAsync(entity => entity.RoasterId == request.Id, cancellationToken);

        if (hasBeans)
        {
            throw new ConflictException("Roaster cannot be deleted because it has beans.");
        }

        dbContext.Roasters.Remove(roaster);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
