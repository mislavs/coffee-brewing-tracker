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

        group.MapGet("/country-map", GetCountryMapStats)
            .WithName("GetCountryMapStats");

        group.MapGet("/coffee-consumption", GetCoffeeConsumption)
            .WithName("GetCoffeeConsumption")
            .Produces<CoffeeConsumptionSeriesDto>();

        return app;
    }

    private static async Task<Ok<DashboardStatsDto>> GetDashboardStats(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var stats = await sender.Send(new GetDashboardStatsQuery(), cancellationToken);
        return TypedResults.Ok(stats);
    }

    private static async Task<Ok<IReadOnlyList<CountryMapStatsDto>>> GetCountryMapStats(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var stats = await sender.Send(new GetCountryMapStatsQuery(), cancellationToken);
        return TypedResults.Ok(stats);
    }

    private static async Task<Ok<CoffeeConsumptionSeriesDto>> GetCoffeeConsumption(
        DateOnly from,
        DateOnly to,
        CoffeeConsumptionGranularity granularity,
        string timeZone,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var stats = await sender.Send(
            new GetCoffeeConsumptionQuery(from, to, granularity, timeZone),
            cancellationToken);

        return TypedResults.Ok(stats);
    }
}
