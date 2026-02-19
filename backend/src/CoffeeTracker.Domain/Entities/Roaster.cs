using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Roaster
{
    private readonly List<Bean> _beans = [];

    private Roaster()
    {
    }

    private Roaster(Guid id, string name, string? city, string? country)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        City = EntityNormalization.NormalizeOptional(city);
        Country = EntityNormalization.NormalizeOptional(country);
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? City { get; private set; }

    public string? Country { get; private set; }

    public IReadOnlyCollection<Bean> Beans => _beans.AsReadOnly();

    public static Roaster Create(string name, string? city, string? country)
    {
        return new Roaster(Guid.NewGuid(), name, city, country);
    }

    public void Update(string name, string? city, string? country)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        City = EntityNormalization.NormalizeOptional(city);
        Country = EntityNormalization.NormalizeOptional(country);
    }
}
