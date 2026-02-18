namespace CoffeeTracker.Domain.Entities;

public class Roaster
{
    private Roaster()
    {
    }

    private Roaster(Guid id, string name, string? city, string? country)
    {
        Id = id;
        Name = NormalizeRequired(name, nameof(name));
        City = NormalizeOptional(city);
        Country = NormalizeOptional(country);
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? City { get; private set; }

    public string? Country { get; private set; }

    public static Roaster Create(string name, string? city, string? country)
    {
        return new Roaster(Guid.NewGuid(), name, city, country);
    }

    public void Update(string name, string? city, string? country)
    {
        Name = NormalizeRequired(name, nameof(name));
        City = NormalizeOptional(city);
        Country = NormalizeOptional(country);
    }

    private static string NormalizeRequired(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value is required.", parameterName);
        }

        return value.Trim();
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}
