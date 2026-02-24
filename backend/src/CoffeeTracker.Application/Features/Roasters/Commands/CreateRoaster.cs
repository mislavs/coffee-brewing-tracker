using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record CreateRoasterCommand(string Name, string? City, Guid? CountryId) : IRequest<Guid>;

public sealed class CreateRoasterValidator : AbstractValidator<CreateRoasterCommand>
{
    public CreateRoasterValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.City)
            .MaximumLength(100);

    }
}

public sealed class CreateRoasterHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateRoasterCommand, Guid>
{
    public async Task<Guid> Handle(CreateRoasterCommand request, CancellationToken cancellationToken)
    {
        if (request.CountryId.HasValue)
        {
            var countryExists = await dbContext.Countries
                .AnyAsync(entity => entity.Id == request.CountryId.Value, cancellationToken);

            if (!countryExists)
            {
                throw new NotFoundException($"Country '{request.CountryId.Value}' was not found.");
            }
        }

        var roaster = Roaster.Create(request.Name, request.City, request.CountryId);
        dbContext.Roasters.Add(roaster);
        await dbContext.SaveChangesAsync(cancellationToken);
        return roaster.Id;
    }
}
