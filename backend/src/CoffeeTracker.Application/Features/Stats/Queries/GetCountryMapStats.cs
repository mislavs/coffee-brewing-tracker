using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Stats.Queries;

public sealed record GetCountryMapStatsQuery : IRequest<IReadOnlyList<CountryMapStatsDto>>;

public sealed class GetCountryMapStatsHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetCountryMapStatsQuery, IReadOnlyList<CountryMapStatsDto>>
{
    public async Task<IReadOnlyList<CountryMapStatsDto>> Handle(
        GetCountryMapStatsQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Countries
            .AsNoTracking()
            .Where(country => dbContext.Beans
                .Any(bean => bean.OriginCountries.Any(originCountry => originCountry.Id == country.Id)))
            .OrderBy(country => country.Name)
            .Select(country => new CountryMapStatsDto(
                country.Id,
                country.Name,
                country.IsoAlpha2,
                country.IsoNumericCode,
                dbContext.Beans
                    .Count(bean => bean.OriginCountries.Any(originCountry => originCountry.Id == country.Id)),
                dbContext.Beans
                    .Where(bean => bean.OriginCountries.Any(originCountry => originCountry.Id == country.Id))
                    .Sum(bean => bean.BagWeight),
                dbContext.BrewLogEntries
                    .Where(entry => entry.Bean.OriginCountries.Any(originCountry => originCountry.Id == country.Id))
                    .Where(entry => entry.Rating.HasValue)
                    .Select(entry => (decimal?)(int)entry.Rating!.Value)
                    .Average(),
                dbContext.BrewLogEntries
                    .Count(entry => entry.Bean.OriginCountries.Any(originCountry => originCountry.Id == country.Id))))
            .ToListAsync(cancellationToken);
    }
}
