using CoffeeTracker.Application.Features.FlavorNotes.Dtos;
using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Application.Features.Beans.Dtos;

public sealed record BeanDto(
    Guid Id,
    string Name,
    Guid RoasterId,
    string RoasterName,
    OriginType OriginType,
    IReadOnlyList<string> OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    decimal? PricePerKg,
    IReadOnlyList<FlavorNoteDto> FlavorNotes,
    decimal RemainingQuantity);
