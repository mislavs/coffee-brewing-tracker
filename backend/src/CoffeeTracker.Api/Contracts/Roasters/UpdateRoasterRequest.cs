namespace CoffeeTracker.Api.Contracts.Roasters;

public sealed record UpdateRoasterRequest(
    string Name,
    string? City,
    Guid? CountryId,
    string? WebsiteUrl);
