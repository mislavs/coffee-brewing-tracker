using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.Roasters.Commands;
using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Application.Features.Roasters.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class RoasterEndpoints
{
    public static IEndpointRouteBuilder MapRoasterEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/roasters")
            .WithTags("Roasters");

        group.MapGet("/", GetRoasters)
            .WithName("GetRoasters");

        group.MapGet("/{id:guid}", GetRoasterById)
            .WithName("GetRoasterById");

        group.MapPost("/", CreateRoaster)
            .WithName("CreateRoaster");

        group.MapPut("/{id:guid}", UpdateRoaster)
            .WithName("UpdateRoaster");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<RoasterSummaryDto>>> GetRoasters(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var roasters = await sender.Send(new GetRoastersListQuery(), cancellationToken);
        return TypedResults.Ok(roasters);
    }

    private static async Task<Ok<RoasterDto>> GetRoasterById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var roaster = await sender.Send(new GetRoasterByIdQuery(id), cancellationToken);
        return TypedResults.Ok(roaster);
    }

    private static async Task<Created<CreateRoasterResponse>> CreateRoaster(
        CreateRoasterRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var roasterId = await sender.Send(
            new CreateRoasterCommand(request.Name, request.City, request.Country),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetRoasterById",
                           new { id = roasterId }) ??
                       $"/api/roasters/{roasterId}";

        return TypedResults.Created(location, new CreateRoasterResponse(roasterId));
    }

    private static async Task<Ok> UpdateRoaster(
        Guid id,
        UpdateRoasterRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateRoasterCommand(id, request.Name, request.City, request.Country),
            cancellationToken);

        return TypedResults.Ok();
    }
}
