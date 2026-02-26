using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.Beans.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class BeanEndpoints
{
    public static IEndpointRouteBuilder MapBeanEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/beans")
            .WithTags("Beans");

        group.MapGet("/", GetBeans)
            .WithName("GetBeans");

        group.MapGet("/{id:guid}", GetBeanById)
            .WithName("GetBeanById");

        group.MapPost("/", CreateBean)
            .WithName("CreateBean");

        group.MapPut("/{id:guid}", UpdateBean)
            .WithName("UpdateBean");

        group.MapPatch("/{id:guid}/availability", SetBeanAvailability)
            .WithName("SetBeanAvailability");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<BeanSummaryDto>>> GetBeans(
        string? search,
        bool? includeUnavailable,
        Guid? country,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var beans = await sender.Send(
            new GetBeansListQuery(search, includeUnavailable ?? false, country),
            cancellationToken);
        return TypedResults.Ok(beans);
    }

    private static async Task<Ok<BeanDto>> GetBeanById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var bean = await sender.Send(new GetBeanByIdQuery(id), cancellationToken);
        return TypedResults.Ok(bean);
    }

    private static async Task<Created<CreateBeanResponse>> CreateBean(
        CreateBeanRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var beanId = await sender.Send(
            new CreateBeanCommand(
                request.Name,
                request.RoasterId,
                request.OriginType,
                request.OriginCountries,
                request.Variety,
                request.ProcessingMethod,
                request.RoastProfile,
                request.RoastDate,
                request.Altitude,
                request.BagWeight,
                request.Price,
                request.FlavorNoteNames),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetBeanById",
                           new { id = beanId }) ??
                       $"/api/beans/{beanId}";

        return TypedResults.Created(location, new CreateBeanResponse(beanId));
    }

    private static async Task<Ok> UpdateBean(
        Guid id,
        UpdateBeanRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateBeanCommand(
                id,
                request.Name,
                request.RoasterId,
                request.OriginType,
                request.OriginCountries,
                request.Variety,
                request.ProcessingMethod,
                request.RoastProfile,
                request.RoastDate,
                request.Altitude,
                request.BagWeight,
                request.Price,
                request.IsAvailable,
                request.FlavorNoteNames),
            cancellationToken);

        return TypedResults.Ok();
    }

    private static async Task<Ok> SetBeanAvailability(
        Guid id,
        SetBeanAvailabilityRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new SetBeanAvailabilityCommand(id, request.IsAvailable),
            cancellationToken);

        return TypedResults.Ok();
    }
}
