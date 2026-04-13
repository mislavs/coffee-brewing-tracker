using CoffeeTracker.Domain.Common;

namespace CoffeeTracker.Domain.Entities;

public class Roaster
{
    private const int MaxLogoFileNameLength = 255;
    private readonly List<Bean> _beans = [];

    private Roaster()
    {
    }

    private Roaster(Guid id, string name, string? city, Guid? countryId, string? websiteUrl)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        City = EntityNormalization.NormalizeOptional(city);
        CountryId = countryId;
        WebsiteUrl = EntityNormalization.NormalizeOptional(websiteUrl);
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? City { get; private set; }

    public Guid? CountryId { get; private set; }

    public Country? Country { get; private set; }

    public string? WebsiteUrl { get; private set; }

    public string? LogoFileName { get; private set; }

    public byte[]? LogoData { get; private set; }

    public IReadOnlyCollection<Bean> Beans => _beans.AsReadOnly();

    public static Roaster Create(string name, string? city, Guid? countryId, string? websiteUrl = null)
    {
        return new Roaster(Guid.NewGuid(), name, city, countryId, websiteUrl);
    }

    public void Update(string name, string? city, Guid? countryId, string? websiteUrl = null)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        City = EntityNormalization.NormalizeOptional(city);
        CountryId = countryId;
        WebsiteUrl = EntityNormalization.NormalizeOptional(websiteUrl);
    }

    public void SetLogo(string fileName, byte[] data)
    {
        LogoFileName = EntityNormalization.NormalizeRequired(fileName, nameof(fileName));
        if (LogoFileName.Length > MaxLogoFileNameLength)
        {
            throw new ArgumentException(
                $"Logo file name must be {MaxLogoFileNameLength} characters or fewer.",
                nameof(fileName));
        }

        ArgumentNullException.ThrowIfNull(data);
        if (data.Length == 0)
        {
            throw new ArgumentException("Logo data cannot be empty.", nameof(data));
        }

        LogoData = data.ToArray();
    }

    public void RemoveLogo()
    {
        LogoFileName = null;
        LogoData = null;
    }
}
