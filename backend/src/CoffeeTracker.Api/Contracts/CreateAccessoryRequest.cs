namespace CoffeeTracker.Api.Contracts;

public sealed record CreateAccessoryRequest(string Name, List<Guid>? BrewerIds);
