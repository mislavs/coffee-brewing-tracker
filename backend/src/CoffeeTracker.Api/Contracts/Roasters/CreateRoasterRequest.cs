namespace CoffeeTracker.Api.Contracts.Roasters;

public sealed record CreateRoasterRequest(
    string Name,
    string? City,
    Guid? CountryId);
