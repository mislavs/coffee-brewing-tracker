using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record CreateRoasterCommand(string Name, string? City, string? Country) : IRequest<Guid>;

public sealed class CreateRoasterValidator : AbstractValidator<CreateRoasterCommand>
{
    public CreateRoasterValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(command => command.City)
            .MaximumLength(100);

        RuleFor(command => command.Country)
            .MaximumLength(100);
    }
}

public sealed class CreateRoasterHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateRoasterCommand, Guid>
{
    public async Task<Guid> Handle(CreateRoasterCommand request, CancellationToken cancellationToken)
    {
        var roaster = Roaster.Create(request.Name, request.City, request.Country);
        dbContext.Roasters.Add(roaster);
        await dbContext.SaveChangesAsync(cancellationToken);
        return roaster.Id;
    }
}
