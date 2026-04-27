using CoffeeTracker.Domain.Common;
using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Domain.Entities;

public class BrewLogEntry
{
    private readonly List<Accessory> _accessories = [];

    private BrewLogEntry()
    {
    }

    private BrewLogEntry(
        Guid id,
        Guid beanId,
        Guid brewerId,
        Guid grinderId,
        Guid? recipeId,
        decimal dose,
        decimal waterAmount,
        decimal? waterTemperature,
        decimal? grindSize,
        int? brewTimeSeconds,
        BrewRating? rating,
        string? notes,
        string? adjustmentIdeas,
        DateTime brewedAt)
    {
        Id = id;
        BeanId = EntityNormalization.EnsureRequired(beanId, nameof(beanId));
        BrewerId = EntityNormalization.EnsureRequired(brewerId, nameof(brewerId));
        GrinderId = EntityNormalization.EnsureRequired(grinderId, nameof(grinderId));
        RecipeId = recipeId;
        Dose = dose;
        WaterAmount = waterAmount;
        WaterTemperature = waterTemperature;
        GrindSize = grindSize;
        BrewTimeSeconds = brewTimeSeconds;
        Rating = rating;
        Notes = EntityNormalization.NormalizeOptional(notes);
        AdjustmentIdeas = EntityNormalization.NormalizeOptional(adjustmentIdeas);
        BrewedAt = brewedAt;
    }

    public Guid Id { get; private set; }

    public Guid BeanId { get; private set; }

    public Guid BrewerId { get; private set; }

    public Guid GrinderId { get; private set; }

    public Guid? RecipeId { get; private set; }

    public decimal Dose { get; private set; }

    public decimal WaterAmount { get; private set; }

    public decimal? WaterTemperature { get; private set; }

    public decimal? GrindSize { get; private set; }

    public int? BrewTimeSeconds { get; private set; }

    public BrewRating? Rating { get; private set; }

    public string? Notes { get; private set; }

    public string? AdjustmentIdeas { get; private set; }

    public DateTime BrewedAt { get; private set; }

    public decimal? BrewRatio => Dose > 0m && WaterAmount > 0m
        ? WaterAmount / Dose
        : null;

    public Bean Bean { get; private set; } = null!;

    public Brewer Brewer { get; private set; } = null!;

    public Grinder Grinder { get; private set; } = null!;

    public Recipe? Recipe { get; private set; }

    public IReadOnlyCollection<Accessory> Accessories => _accessories.AsReadOnly();

    public static BrewLogEntry Create(
        Guid beanId,
        Guid brewerId,
        Guid grinderId,
        Guid? recipeId,
        decimal dose,
        decimal waterAmount,
        decimal? waterTemperature,
        decimal? grindSize,
        int? brewTimeSeconds,
        BrewRating? rating,
        string? notes,
        string? adjustmentIdeas,
        DateTime brewedAt)
    {
        return new BrewLogEntry(
            Guid.NewGuid(),
            beanId,
            brewerId,
            grinderId,
            recipeId,
            dose,
            waterAmount,
            waterTemperature,
            grindSize,
            brewTimeSeconds,
            rating,
            notes,
            adjustmentIdeas,
            brewedAt);
    }

    public void Update(
        Guid beanId,
        Guid brewerId,
        Guid grinderId,
        Guid? recipeId,
        decimal dose,
        decimal waterAmount,
        decimal? waterTemperature,
        decimal? grindSize,
        int? brewTimeSeconds,
        BrewRating? rating,
        string? notes,
        string? adjustmentIdeas,
        DateTime brewedAt)
    {
        BeanId = EntityNormalization.EnsureRequired(beanId, nameof(beanId));
        BrewerId = EntityNormalization.EnsureRequired(brewerId, nameof(brewerId));
        GrinderId = EntityNormalization.EnsureRequired(grinderId, nameof(grinderId));
        RecipeId = recipeId;
        Dose = dose;
        WaterAmount = waterAmount;
        WaterTemperature = waterTemperature;
        GrindSize = grindSize;
        BrewTimeSeconds = brewTimeSeconds;
        Rating = rating;
        Notes = EntityNormalization.NormalizeOptional(notes);
        AdjustmentIdeas = EntityNormalization.NormalizeOptional(adjustmentIdeas);
        BrewedAt = brewedAt;
    }

    public void SetRating(BrewRating? rating)
    {
        Rating = rating;
    }

    public void SetAccessories(IEnumerable<Accessory>? accessories)
    {
        _accessories.Clear();

        if (accessories is null)
        {
            return;
        }

        foreach (var accessory in accessories.DistinctBy(entity => entity.Id))
        {
            _accessories.Add(accessory);
        }
    }
}
