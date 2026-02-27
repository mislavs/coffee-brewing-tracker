using CoffeeTracker.Application.Features.Features.Queries.GetFeatures;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class FeatureEndpoints
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/features")
            .WithTags("Features");

        group.MapGet("/", GetFeatures)
            .WithName("GetFeatures");

        return app;
    }

    private static async Task<Ok<FeaturesDto>> GetFeatures(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetFeaturesQuery(), cancellationToken);
        return TypedResults.Ok(result);
    }
}
