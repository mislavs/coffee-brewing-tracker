using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record DeleteBeanImageCommand(Guid Id) : IRequest;

public sealed class DeleteBeanImageValidator : AbstractValidator<DeleteBeanImageCommand>
{
    public DeleteBeanImageValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();
    }
}

public sealed class DeleteBeanImageHandler(ApplicationDbContext dbContext)
    : IRequestHandler<DeleteBeanImageCommand>
{
    public async Task Handle(DeleteBeanImageCommand request, CancellationToken cancellationToken)
    {
        var rowsAffected = await dbContext.Beans
            .Where(entity => entity.Id == request.Id)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(entity => entity.ImageFileName, (string?)null)
                    .SetProperty(entity => entity.ImageData, (byte[]?)null),
                cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }
    }
}
