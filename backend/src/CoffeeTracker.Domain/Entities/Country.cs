using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Country : IHasName
{
    private Country()
    {
    }

    private Country(Guid id, string name, string isoAlpha2, string isoNumericCode)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        IsoAlpha2 = NormalizeIsoAlpha2(isoAlpha2);
        IsoNumericCode = NormalizeIsoNumericCode(isoNumericCode);
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string IsoAlpha2 { get; private set; } = string.Empty;

    public string IsoNumericCode { get; private set; } = string.Empty;

    public static Country Create(string name, string isoAlpha2, string isoNumericCode)
    {
        return new Country(Guid.NewGuid(), name, isoAlpha2, isoNumericCode);
    }

    private static string NormalizeIsoAlpha2(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToUpperInvariant();

        if (normalized.Length != 2)
        {
            throw new ArgumentException("ISO alpha-2 code must be 2 characters.", nameof(value));
        }

        return normalized;
    }

    private static string NormalizeIsoNumericCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim();

        if (normalized.Length != 3 || !normalized.All(char.IsDigit))
        {
            throw new ArgumentException("ISO numeric code must be exactly 3 digits.", nameof(value));
        }

        return normalized;
    }
}
