using CoffeeTracker.Application.Common.Resolvers;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;

namespace CoffeeTracker.Application.Features.FlavorNotes;

public static class FlavorNoteResolver
{
    /// <summary>
    /// Resolves flavor notes by name: loads existing ones, creates new ones for missing names,
    /// and returns them ordered by name. New flavor notes are added to the context but not saved.
    /// </summary>
    public static async Task<IReadOnlyList<FlavorNote>> ResolveFlavorNotesAsync(
        this ApplicationDbContext dbContext,
        IReadOnlyList<string>? flavorNoteNames,
        CancellationToken cancellationToken = default)
    {
        return await NamedEntityResolver.ResolveByNameAsync(
            dbContext.FlavorNotes,
            flavorNoteNames,
            FlavorNote.Create,
            cancellationToken);
    }
}
