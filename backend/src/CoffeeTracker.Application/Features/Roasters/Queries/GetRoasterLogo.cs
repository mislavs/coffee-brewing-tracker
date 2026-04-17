using CoffeeTracker.Application.Common.Images;
using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Queries;

public sealed record GetRoasterLogoQuery(Guid Id) : IRequest<RoasterLogoDto>;

public sealed class GetRoasterLogoValidator : AbstractValidator<GetRoasterLogoQuery>
{
    public GetRoasterLogoValidator()
    {
        RuleFor(query => query.Id)
            .NotEmpty();
    }
}

public sealed class GetRoasterLogoHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRoasterLogoQuery, RoasterLogoDto>
{
    private static readonly KeyValuePair<string, string>[] AdditionalContentTypeMappings =
    [
        new(".svg", "image/svg+xml")
    ];

    public async Task<RoasterLogoDto> Handle(GetRoasterLogoQuery request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new { entity.LogoData, entity.LogoFileName })
            .FirstOrDefaultAsync(cancellationToken);

        if (roaster is null)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }

        if (roaster.LogoData is null || string.IsNullOrWhiteSpace(roaster.LogoFileName))
        {
            throw new NotFoundException($"Roaster '{request.Id}' does not have a logo.");
        }

        return new RoasterLogoDto(
            roaster.LogoData,
            ImageContentTypeInference.GetContentTypeForFile(
                roaster.LogoFileName,
                AdditionalContentTypeMappings),
            roaster.LogoFileName);
    }
}
