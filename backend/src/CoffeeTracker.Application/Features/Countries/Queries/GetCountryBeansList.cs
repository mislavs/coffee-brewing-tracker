using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Countries.Queries;

public sealed record GetCountryBeansListQuery(Guid CountryId) : IRequest<IReadOnlyList<BeanSummaryDto>>;

public sealed class GetCountryBeansListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetCountryBeansListQuery, IReadOnlyList<BeanSummaryDto>>
{
    public async Task<IReadOnlyList<BeanSummaryDto>> Handle(
        GetCountryBeansListQuery request,
        CancellationToken cancellationToken)
    {
        var countryExists = await dbContext.Countries
            .AnyAsync(entity => entity.Id == request.CountryId, cancellationToken);

        if (!countryExists)
        {
            throw new NotFoundException($"Country '{request.CountryId}' was not found.");
        }

        return await dbContext.Beans
            .AsNoTracking()
            .Where(entity => entity.OriginCountries.Any(country => country.Id == request.CountryId))
            .Where(entity => entity.IsAvailable)
            .OrderBy(entity => entity.Name)
            .Select(BeanSummaryProjection.ToDto(dbContext))
            .ToListAsync(cancellationToken);
    }
}
