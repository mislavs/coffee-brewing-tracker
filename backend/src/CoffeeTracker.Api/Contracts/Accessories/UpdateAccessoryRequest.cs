namespace CoffeeTracker.Api.Contracts.Accessories;

public sealed record UpdateAccessoryRequest(string Name, List<Guid>? BrewerIds);
