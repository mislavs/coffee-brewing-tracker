using CoffeeTracker.Application.Common.Resolvers;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;

namespace CoffeeTracker.Application.Features.Countries;

public static class CountryResolver
{
    public static async Task<IReadOnlyList<Country>> ResolveCountriesAsync(
        this ApplicationDbContext dbContext,
        IReadOnlyList<string>? countryNames,
        CancellationToken cancellationToken = default)
    {
        return await NamedEntityResolver.ResolveByNameAsync(
            dbContext.Countries,
            countryNames,
            Country.Create,
            cancellationToken);
    }
}
