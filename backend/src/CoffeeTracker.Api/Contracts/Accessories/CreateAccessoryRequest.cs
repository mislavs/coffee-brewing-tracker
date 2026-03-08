namespace CoffeeTracker.Api.Contracts.Accessories;

public sealed record CreateAccessoryRequest(string Name, List<Guid>? BrewerIds);
