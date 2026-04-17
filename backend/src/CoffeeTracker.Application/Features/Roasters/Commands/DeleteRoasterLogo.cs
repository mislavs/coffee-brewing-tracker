using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record DeleteRoasterLogoCommand(Guid Id) : IRequest;

public sealed class DeleteRoasterLogoValidator : AbstractValidator<DeleteRoasterLogoCommand>
{
    public DeleteRoasterLogoValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}

public sealed class DeleteRoasterLogoHandler(ApplicationDbContext dbContext)
    : IRequestHandler<DeleteRoasterLogoCommand>
{
    public async Task Handle(DeleteRoasterLogoCommand request, CancellationToken cancellationToken)
    {
        var rowsAffected = await dbContext.Roasters
            .Where(entity => entity.Id == request.Id)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(entity => entity.LogoFileName, (string?)null)
                    .SetProperty(entity => entity.LogoData, (byte[]?)null),
                cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }
    }
}
