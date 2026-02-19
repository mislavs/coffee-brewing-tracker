using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Country : IHasName
{
    private Country()
    {
    }

    private Country(Guid id, string name)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public static Country Create(string name)
    {
        return new Country(Guid.NewGuid(), name);
    }
}
