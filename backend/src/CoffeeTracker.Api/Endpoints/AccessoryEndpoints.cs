using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.Accessories.Commands;
using CoffeeTracker.Application.Features.Accessories.Dtos;
using CoffeeTracker.Application.Features.Accessories.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class AccessoryEndpoints
{
    public static IEndpointRouteBuilder MapAccessoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/accessories")
            .WithTags("Accessories");

        group.MapGet("/", GetAccessories)
            .WithName("GetAccessories");

        group.MapGet("/{id:guid}", GetAccessoryById)
            .WithName("GetAccessoryById");

        group.MapPost("/", CreateAccessory)
            .WithName("CreateAccessory");

        group.MapPut("/{id:guid}", UpdateAccessory)
            .WithName("UpdateAccessory");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<AccessorySummaryDto>>> GetAccessories(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var accessories = await sender.Send(new GetAccessoriesListQuery(), cancellationToken);
        return TypedResults.Ok(accessories);
    }

    private static async Task<Ok<AccessoryDto>> GetAccessoryById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var accessory = await sender.Send(new GetAccessoryByIdQuery(id), cancellationToken);
        return TypedResults.Ok(accessory);
    }

    private static async Task<Created<CreateAccessoryResponse>> CreateAccessory(
        CreateAccessoryRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var accessoryId = await sender.Send(
            new CreateAccessoryCommand(request.Name, request.BrewerIds),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetAccessoryById",
                           new { id = accessoryId }) ??
                       $"/api/accessories/{accessoryId}";

        return TypedResults.Created(location, new CreateAccessoryResponse(accessoryId));
    }

    private static async Task<Ok> UpdateAccessory(
        Guid id,
        UpdateAccessoryRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateAccessoryCommand(id, request.Name, request.BrewerIds),
            cancellationToken);

        return TypedResults.Ok();
    }
}
