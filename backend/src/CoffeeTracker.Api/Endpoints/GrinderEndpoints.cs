using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.Grinders.Commands;
using CoffeeTracker.Application.Features.Grinders.Dtos;
using CoffeeTracker.Application.Features.Grinders.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class GrinderEndpoints
{
    public static IEndpointRouteBuilder MapGrinderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/grinders")
            .WithTags("Grinders");

        group.MapGet("/", GetGrinders)
            .WithName("GetGrinders");

        group.MapGet("/{id:guid}", GetGrinderById)
            .WithName("GetGrinderById");

        group.MapPost("/", CreateGrinder)
            .WithName("CreateGrinder");

        group.MapPut("/{id:guid}", UpdateGrinder)
            .WithName("UpdateGrinder");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<GrinderSummaryDto>>> GetGrinders(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var grinders = await sender.Send(new GetGrindersListQuery(), cancellationToken);
        return TypedResults.Ok(grinders);
    }

    private static async Task<Ok<GrinderDto>> GetGrinderById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var grinder = await sender.Send(new GetGrinderByIdQuery(id), cancellationToken);
        return TypedResults.Ok(grinder);
    }

    private static async Task<Created<CreateGrinderResponse>> CreateGrinder(
        CreateGrinderRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var grinderId = await sender.Send(
            new CreateGrinderCommand(request.Name),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetGrinderById",
                           new { id = grinderId }) ??
                       $"/api/grinders/{grinderId}";

        return TypedResults.Created(location, new CreateGrinderResponse(grinderId));
    }

    private static async Task<Ok> UpdateGrinder(
        Guid id,
        UpdateGrinderRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateGrinderCommand(id, request.Name),
            cancellationToken);

        return TypedResults.Ok();
    }
}
