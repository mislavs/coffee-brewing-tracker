using CoffeeTracker.Domain.Common;
using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Domain.Entities;

public class Bean
{
    private readonly List<FlavorNote> _flavorNotes = [];
    private readonly List<Country> _originCountries = [];

    private Bean()
    {
    }

    private Bean(
        Guid id,
        string name,
        Guid roasterId,
        OriginType originType,
        IEnumerable<Country>? originCountries,
        string? variety,
        string? processingMethod,
        RoastProfile roastProfile,
        DateOnly? roastDate,
        int? altitude,
        decimal bagWeight,
        decimal? price)
    {
        Id = id;
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        RoasterId = EntityNormalization.EnsureRequired(roasterId, nameof(roasterId));
        OriginType = originType;
        SetOriginCountries(originCountries);
        Variety = EntityNormalization.NormalizeOptional(variety);
        ProcessingMethod = EntityNormalization.NormalizeOptional(processingMethod);
        RoastProfile = roastProfile;
        RoastDate = roastDate;
        Altitude = altitude;
        BagWeight = bagWeight;
        Price = price;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public Guid RoasterId { get; private set; }

    public OriginType OriginType { get; private set; }

    public IReadOnlyCollection<Country> OriginCountries => _originCountries.AsReadOnly();

    public string? Variety { get; private set; }

    public string? ProcessingMethod { get; private set; }

    public RoastProfile RoastProfile { get; private set; }

    public DateOnly? RoastDate { get; private set; }

    public int? Altitude { get; private set; }

    public decimal BagWeight { get; private set; }

    public decimal? Price { get; private set; }

    public bool IsAvailable { get; private set; } = true;

    public Roaster Roaster { get; private set; } = null!;

    public IReadOnlyCollection<FlavorNote> FlavorNotes => _flavorNotes.AsReadOnly();

    public decimal? PricePerKg => Price.HasValue && BagWeight > 0
        ? Price.Value / (BagWeight / 1000m)
        : null;

    public static Bean Create(
        string name,
        Guid roasterId,
        OriginType originType,
        IEnumerable<Country>? originCountries,
        string? variety,
        string? processingMethod,
        RoastProfile roastProfile,
        DateOnly? roastDate,
        int? altitude,
        decimal bagWeight,
        decimal? price)
    {
        return new Bean(
            Guid.NewGuid(),
            name,
            roasterId,
            originType,
            originCountries,
            variety,
            processingMethod,
            roastProfile,
            roastDate,
            altitude,
            bagWeight,
            price);
    }

    public void Update(
        string name,
        Guid roasterId,
        OriginType originType,
        IEnumerable<Country>? originCountries,
        string? variety,
        string? processingMethod,
        RoastProfile roastProfile,
        DateOnly? roastDate,
        int? altitude,
        decimal bagWeight,
        decimal? price,
        bool isAvailable)
    {
        Name = EntityNormalization.NormalizeRequired(name, nameof(name));
        RoasterId = EntityNormalization.EnsureRequired(roasterId, nameof(roasterId));
        OriginType = originType;
        SetOriginCountries(originCountries);
        Variety = EntityNormalization.NormalizeOptional(variety);
        ProcessingMethod = EntityNormalization.NormalizeOptional(processingMethod);
        RoastProfile = roastProfile;
        RoastDate = roastDate;
        Altitude = altitude;
        BagWeight = bagWeight;
        Price = price;
        IsAvailable = isAvailable;
    }

    public void SetAvailability(bool isAvailable)
    {
        IsAvailable = isAvailable;
    }

    public void SetFlavorNotes(IEnumerable<FlavorNote> flavorNotes)
    {
        ArgumentNullException.ThrowIfNull(flavorNotes);

        _flavorNotes.Clear();

        foreach (var flavorNote in flavorNotes.DistinctBy(note => note.Id))
        {
            _flavorNotes.Add(flavorNote);
        }
    }

    public void SetOriginCountries(IEnumerable<Country>? originCountries)
    {
        _originCountries.Clear();

        if (originCountries is null)
        {
            return;
        }

        foreach (var country in originCountries.DistinctBy(country => country.Id))
        {
            _originCountries.Add(country);
        }
    }

}
