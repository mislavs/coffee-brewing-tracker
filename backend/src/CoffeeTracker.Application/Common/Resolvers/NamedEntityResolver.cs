using CoffeeTracker.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Common.Resolvers;

public static class NamedEntityResolver
{
    public static async Task<IReadOnlyList<TEntity>> ResolveByNameAsync<TEntity>(
        DbSet<TEntity> set,
        IReadOnlyList<string>? names,
        Func<string, TEntity> factory,
        CancellationToken cancellationToken = default)
        where TEntity : class, IHasName
    {
        var normalizedNames = (names ?? [])
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedNames.Count == 0)
        {
            return [];
        }

        var normalizedNamesLower = normalizedNames
            .Select(name => name.ToLower())
            .ToList();

        var existingEntities = await set
            .Where(entity => normalizedNamesLower.Contains(entity.Name.ToLower()))
            .ToListAsync(cancellationToken);

        var existingNames = existingEntities
            .Select(entity => entity.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var newEntities = normalizedNames
            .Where(name => !existingNames.Contains(name))
            .Select(factory)
            .ToList();

        if (newEntities.Count > 0)
        {
            set.AddRange(newEntities);
        }

        return existingEntities
            .Concat(newEntities)
            .OrderBy(entity => entity.Name)
            .ToList();
    }
}
