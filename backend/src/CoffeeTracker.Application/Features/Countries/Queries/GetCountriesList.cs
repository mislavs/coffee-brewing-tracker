using CoffeeTracker.Application.Features.Countries.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Countries.Queries;

public sealed record GetCountriesListQuery : IRequest<IReadOnlyList<CountryDto>>;

public sealed class GetCountriesListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetCountriesListQuery, IReadOnlyList<CountryDto>>
{
    public async Task<IReadOnlyList<CountryDto>> Handle(
        GetCountriesListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Countries
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new CountryDto(
                entity.Id,
                entity.Name,
                entity.IsoAlpha2,
                entity.IsoNumericCode))
            .ToListAsync(cancellationToken);
    }
}
