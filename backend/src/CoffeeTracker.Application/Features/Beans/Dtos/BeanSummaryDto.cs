using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Application.Features.Beans.Dtos;

public sealed record BeanSummaryDto(
    Guid Id,
    string Name,
    string RoasterName,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    decimal BagWeight,
    decimal? PricePerKg,
    bool HasImage,
    string? ImageUrl,
    bool IsAvailable,
    decimal RemainingQuantity);
