using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record UpdateRoasterCommand(
    Guid Id,
    string Name,
    string? City,
    string? Country) : IRequest;

public sealed class UpdateRoasterValidator : AbstractValidator<UpdateRoasterCommand>
{
    public UpdateRoasterValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.City)
            .MaximumLength(100);

        RuleFor(command => command.Country)
            .MaximumLength(100);
    }
}

public sealed class UpdateRoasterHandler(ApplicationDbContext dbContext) : IRequestHandler<UpdateRoasterCommand>
{
    public async Task Handle(UpdateRoasterCommand request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (roaster is null)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }

        roaster.Update(request.Name, request.City, request.Country);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
