using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class FlavorNote : IHasName
{
    private FlavorNote()
    {
    }

    private FlavorNote(Guid id, string name)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public static FlavorNote Create(string name)
    {
        return new FlavorNote(Guid.NewGuid(), name);
    }
}
