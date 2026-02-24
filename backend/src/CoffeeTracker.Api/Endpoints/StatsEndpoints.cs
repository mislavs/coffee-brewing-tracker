using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Application.Features.Stats.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class StatsEndpoints
{
    public static IEndpointRouteBuilder MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/stats")
            .WithTags("Stats");

        group.MapGet("/dashboard", GetDashboardStats)
            .WithName("GetDashboardStats");

        return app;
    }

    private static async Task<Ok<DashboardStatsDto>> GetDashboardStats(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var stats = await sender.Send(new GetDashboardStatsQuery(), cancellationToken);
        return TypedResults.Ok(stats);
    }
}
