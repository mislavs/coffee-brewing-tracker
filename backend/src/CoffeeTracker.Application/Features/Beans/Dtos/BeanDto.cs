using CoffeeTracker.Application.Features.FlavorNotes.Dtos;
using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Application.Features.Beans.Dtos;

public sealed record BeanDto(
    Guid Id,
    string Name,
    Guid RoasterId,
    string RoasterName,
    OriginType OriginType,
    IReadOnlyList<BeanOriginCountryDto> OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    string? Region,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    int? Rating,
    string? Notes,
    decimal? PricePerKg,
    IReadOnlyList<FlavorNoteDto> FlavorNotes,
    bool HasImage,
    string? ImageUrl,
    bool IsAvailable,
    decimal RemainingQuantity);
