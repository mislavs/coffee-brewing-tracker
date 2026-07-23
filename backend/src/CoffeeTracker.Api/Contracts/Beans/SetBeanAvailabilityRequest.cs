namespace CoffeeTracker.Api.Contracts.Beans;

public sealed record SetBeanAvailabilityReviewRequest(int? Rating, string? Notes);

public sealed record SetBeanAvailabilityRequest(
    bool IsAvailable,
    SetBeanAvailabilityReviewRequest? Review = null);
