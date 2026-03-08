using CoffeeTracker.Api.Contracts.Brewers;
using CoffeeTracker.Application.Features.Brewers.Commands;
using CoffeeTracker.Application.Features.Brewers.Dtos;
using CoffeeTracker.Application.Features.Brewers.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class BrewerEndpoints
{
    public static IEndpointRouteBuilder MapBrewerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/brewers")
            .WithTags("Brewers");

        group.MapGet("/", GetBrewers)
            .WithName("GetBrewers");

        group.MapGet("/{id:guid}", GetBrewerById)
            .WithName("GetBrewerById");

        group.MapPost("/", CreateBrewer)
            .WithName("CreateBrewer");

        group.MapPut("/{id:guid}", UpdateBrewer)
            .WithName("UpdateBrewer");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<BrewerSummaryDto>>> GetBrewers(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewers = await sender.Send(new GetBrewersListQuery(), cancellationToken);
        return TypedResults.Ok(brewers);
    }

    private static async Task<Ok<BrewerDto>> GetBrewerById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewer = await sender.Send(new GetBrewerByIdQuery(id), cancellationToken);
        return TypedResults.Ok(brewer);
    }

    private static async Task<Created<CreateBrewerResponse>> CreateBrewer(
        CreateBrewerRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewerId = await sender.Send(
            new CreateBrewerCommand(request.Name),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetBrewerById",
                           new { id = brewerId }) ??
                       $"/api/brewers/{brewerId}";

        return TypedResults.Created(location, new CreateBrewerResponse(brewerId));
    }

    private static async Task<Ok> UpdateBrewer(
        Guid id,
        UpdateBrewerRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateBrewerCommand(id, request.Name),
            cancellationToken);

        return TypedResults.Ok();
    }
}
