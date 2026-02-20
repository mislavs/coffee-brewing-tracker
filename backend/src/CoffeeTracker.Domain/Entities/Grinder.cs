using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Grinder
{
    private Grinder()
    {
    }

    private Grinder(Guid id, string name)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public static Grinder Create(string name)
    {
        return new Grinder(Guid.NewGuid(), name);
    }

    public void Update(string name)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }
}
