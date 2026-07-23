using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record BeanAvailabilityReview(int? Rating, string? Notes);

public sealed record SetBeanAvailabilityCommand(
    Guid BeanId,
    bool IsAvailable,
    BeanAvailabilityReview? Review = null) : IRequest;

public sealed class SetBeanAvailabilityValidator : AbstractValidator<SetBeanAvailabilityCommand>
{
    public SetBeanAvailabilityValidator()
    {
        RuleFor(command => command.BeanId)
            .NotEmpty();

        RuleFor(command => command.Review!.Rating)
            .InclusiveBetween(1, 5)
            .When(command => command.Review?.Rating.HasValue == true);

        RuleFor(command => command.Review!.Notes)
            .MaximumLength(2000)
            .When(command => command.Review is not null);
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

        if (request.Review is not null)
        {
            var rating = request.Review.Rating.HasValue
                ? (BeanRating?)request.Review.Rating.Value
                : null;
            bean.SetReview(rating, request.Review.Notes);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
