using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Application.Features.Beans.Dtos;

public sealed record BeanSummaryDto(
    Guid Id,
    string Name,
    string RoasterName,
    RoastProfile RoastProfile,
    decimal BagWeight,
    decimal? PricePerKg,
    bool IsAvailable,
    decimal RemainingQuantity);
