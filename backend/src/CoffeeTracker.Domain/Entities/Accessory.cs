using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Accessory
{
    private readonly List<Brewer> _compatibleBrewers = [];

    private Accessory()
    {
    }

    private Accessory(Guid id, string name)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public IReadOnlyCollection<Brewer> CompatibleBrewers => _compatibleBrewers.AsReadOnly();

    public static Accessory Create(string name)
    {
        return new Accessory(Guid.NewGuid(), name);
    }

    public void Update(string name)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
    }

    public void SetCompatibleBrewers(IEnumerable<Brewer>? brewers)
    {
        _compatibleBrewers.Clear();

        if (brewers is null)
        {
            return;
        }

        foreach (var brewer in brewers.DistinctBy(entity => entity.Id))
        {
            _compatibleBrewers.Add(brewer);
        }
    }
}
