namespace CoffeeTracker.Api.Contracts;

public sealed record UpdateRoasterRequest(
    string Name,
    string? City,
    Guid? CountryId);
