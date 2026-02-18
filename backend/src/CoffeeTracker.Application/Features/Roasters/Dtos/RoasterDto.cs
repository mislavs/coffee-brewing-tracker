namespace CoffeeTracker.Application.Features.Roasters.Dtos;

public sealed record RoasterDto(
    Guid Id,
    string Name,
    string? City,
    string? Country);
