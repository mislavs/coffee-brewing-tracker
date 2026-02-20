namespace CoffeeTracker.Api.Contracts;

public sealed record UpdateAccessoryRequest(string Name, List<Guid>? BrewerIds);
