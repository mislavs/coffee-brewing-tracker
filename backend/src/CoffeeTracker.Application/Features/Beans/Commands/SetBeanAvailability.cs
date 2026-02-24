using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record SetBeanAvailabilityCommand(Guid BeanId, bool IsAvailable) : IRequest;

public sealed class SetBeanAvailabilityValidator : AbstractValidator<SetBeanAvailabilityCommand>
{
    public SetBeanAvailabilityValidator()
    {
        RuleFor(command => command.BeanId)
            .NotEmpty();
    }
}

public sealed class SetBeanAvailabilityHandler(ApplicationDbContext dbContext)
    : IRequestHandler<SetBeanAvailabilityCommand>
{
    public async Task Handle(SetBeanAvailabilityCommand request, CancellationToken cancellationToken)
    {
        var bean = await dbContext.Beans
            .FirstOrDefaultAsync(entity => entity.Id == request.BeanId, cancellationToken);

        if (bean is null)
        {
            throw new NotFoundException($"Bean '{request.BeanId}' was not found.");
        }

        bean.SetAvailability(request.IsAvailable);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
