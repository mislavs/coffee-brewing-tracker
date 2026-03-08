using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Api.Contracts.Beans;

public sealed record CreateBeanRequest(
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
    IReadOnlyList<string>? FlavorNoteNames);
