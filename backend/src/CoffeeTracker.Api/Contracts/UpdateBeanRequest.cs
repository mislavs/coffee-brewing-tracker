using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Api.Contracts;

public sealed record UpdateBeanRequest(
    string Name,
    Guid RoasterId,
    OriginType OriginType,
    IReadOnlyList<string>? OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    bool IsAvailable,
    IReadOnlyList<string>? FlavorNoteNames);
