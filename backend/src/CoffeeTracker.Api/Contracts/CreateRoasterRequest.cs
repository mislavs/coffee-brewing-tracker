namespace CoffeeTracker.Api.Contracts;

public sealed record CreateRoasterRequest(
    string Name,
    string? City,
    string? Country);
