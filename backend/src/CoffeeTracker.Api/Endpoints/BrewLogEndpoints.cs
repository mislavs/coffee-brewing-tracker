using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Application.Features.BrewLog.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class BrewLogEndpoints
{
    public static IEndpointRouteBuilder MapBrewLogEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/brew-logs")
            .WithTags("BrewLogs");

        group.MapGet("/", GetBrewLogs)
            .WithName("GetBrewLogs");

        group.MapGet("/{id:guid}", GetBrewLogById)
            .WithName("GetBrewLogById");

        group.MapPost("/", CreateBrewLog)
            .WithName("CreateBrewLog");

        group.MapPut("/{id:guid}", UpdateBrewLog)
            .WithName("UpdateBrewLog");

        group.MapDelete("/{id:guid}", DeleteBrewLog)
            .WithName("DeleteBrewLog");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<BrewLogSummaryDto>>> GetBrewLogs(
        string? search,
        DateTime? dateFrom,
        DateTime? dateTo,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewLogs = await sender.Send(new GetBrewLogsListQuery(search, dateFrom, dateTo), cancellationToken);
        return TypedResults.Ok(brewLogs);
    }

    private static async Task<Ok<BrewLogDto>> GetBrewLogById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewLog = await sender.Send(new GetBrewLogByIdQuery(id), cancellationToken);
        return TypedResults.Ok(brewLog);
    }

    private static async Task<Created<CreateBrewLogResponse>> CreateBrewLog(
        CreateBrewLogRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewLogId = await sender.Send(
            new CreateBrewLogCommand(
                request.BeanId,
                request.BrewerId,
                request.GrinderId,
                request.RecipeId,
                request.AccessoryIds,
                request.Dose,
                request.WaterAmount,
                request.WaterTemperature,
                request.GrindSize,
                request.BrewTimeSeconds,
                request.Rating,
                request.Notes,
                request.AdjustmentIdeas,
                request.BrewedAt),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetBrewLogById",
                           new { id = brewLogId }) ??
                       $"/api/brew-logs/{brewLogId}";

        return TypedResults.Created(location, new CreateBrewLogResponse(brewLogId));
    }

    private static async Task<Ok> UpdateBrewLog(
        Guid id,
        UpdateBrewLogRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateBrewLogCommand(
                id,
                request.BeanId,
                request.BrewerId,
                request.GrinderId,
                request.RecipeId,
                request.AccessoryIds,
                request.Dose,
                request.WaterAmount,
                request.WaterTemperature,
                request.GrindSize,
                request.BrewTimeSeconds,
                request.Rating,
                request.Notes,
                request.AdjustmentIdeas,
                request.BrewedAt),
            cancellationToken);

        return TypedResults.Ok();
    }

    private static async Task<NoContent> DeleteBrewLog(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteBrewLogCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }
}
