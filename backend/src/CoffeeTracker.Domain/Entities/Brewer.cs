using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Brewer
{
    private readonly List<Accessory> _accessories = [];

    private Brewer()
    {
    }

    private Brewer(Guid id, string name)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public IReadOnlyCollection<Accessory> Accessories => _accessories.AsReadOnly();

    public static Brewer Create(string name)
    {
        return new Brewer(Guid.NewGuid(), name);
    }

    public void Update(string name)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }
}
