namespace CoffeeTracker.Api.Contracts.BrewLogs;

public sealed record CreateBrewLogResponse(Guid Id, decimal RemainingBeanQuantity);
