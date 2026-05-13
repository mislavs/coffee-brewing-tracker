using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Api.Contracts.Beans;

public sealed record UpdateBeanRequest(
    string Name,
    Guid RoasterId,
    OriginType OriginType,
    IReadOnlyList<Guid>? OriginCountryIds,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    bool IsAvailable,
    IReadOnlyList<string>? FlavorNoteNames,
    string? Region = null);
