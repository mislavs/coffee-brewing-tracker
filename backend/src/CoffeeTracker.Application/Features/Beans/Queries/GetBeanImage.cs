using CoffeeTracker.Application.Common.Images;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public sealed record GetBeanImageQuery(Guid Id) : IRequest<BeanImageDto>;

public sealed class GetBeanImageValidator : AbstractValidator<GetBeanImageQuery>
{
    public GetBeanImageValidator()
    {
        RuleFor(query => query.Id)
            .NotEmpty();
    }
}

public sealed class GetBeanImageHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBeanImageQuery, BeanImageDto>
{
    public async Task<BeanImageDto> Handle(GetBeanImageQuery request, CancellationToken cancellationToken)
    {
        var bean = await dbContext.Beans
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new { entity.ImageData, entity.ImageFileName })
            .FirstOrDefaultAsync(cancellationToken);

        if (bean is null)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }

        if (bean.ImageData is null || string.IsNullOrWhiteSpace(bean.ImageFileName))
        {
            throw new NotFoundException($"Bean '{request.Id}' does not have an image.");
        }

        return new BeanImageDto(
            bean.ImageData,
            ImageContentTypeInference.GetContentTypeForFile(bean.ImageFileName),
            bean.ImageFileName);
    }
}
