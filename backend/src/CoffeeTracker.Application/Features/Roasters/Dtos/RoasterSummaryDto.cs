namespace CoffeeTracker.Application.Features.Roasters.Dtos;

public sealed record RoasterSummaryDto(
    Guid Id,
    string Name,
    string? City,
    string? Country);
