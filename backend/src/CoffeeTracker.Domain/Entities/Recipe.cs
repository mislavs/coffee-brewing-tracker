using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Recipe
{
    private Recipe()
    {
    }

    private Recipe(Guid id, string name, Guid brewerId, string? description)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        BrewerId = EntityNormalization.EnsureRequired(brewerId, nameof(brewerId));
        Description = EntityNormalization.NormalizeOptional(description);
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public Guid BrewerId { get; private set; }

    public string? Description { get; private set; }

    public Brewer Brewer { get; private set; } = null!;

    public static Recipe Create(string name, Guid brewerId, string? description)
    {
        return new Recipe(Guid.NewGuid(), name, brewerId, description);
    }

    public void Update(string name, Guid brewerId, string? description)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        BrewerId = EntityNormalization.EnsureRequired(brewerId, nameof(brewerId));
        Description = EntityNormalization.NormalizeOptional(description);
    }
}
