using CoffeeTracker.Api.Contracts;
using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Infrastructure.AI;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Net.Http.Headers;

namespace CoffeeTracker.Api.Endpoints;

public static class BeanEndpoints
{
    private const int MaxImageUploadBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> SupportedImageMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/webp"
    };

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

        group.MapPost("/parse-image", ParseBeanImage)
            .WithName("ParseBeanImage")
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ParseBeanImageResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

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
                request.OriginCountryIds,
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
                request.OriginCountryIds,
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

    private static async Task<Results<Ok<ParseBeanImageResponse>, ProblemHttpResult>> ParseBeanImage(
        IFormFile? imageFile,
        IAiFeatureAvailability aiFeatureAvailability,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (!aiFeatureAvailability.IsImageBeanParsingAvailable)
        {
            return TypedResults.Problem(
                title: "Image bean parsing is unavailable",
                detail: "Configure extraction AI provider settings to enable this endpoint.",
                statusCode: StatusCodes.Status501NotImplemented);
        }

        if (imageFile is null || imageFile.Length == 0)
        {
            return TypedResults.Problem(
                title: "Image file is required",
                detail: "Provide a non-empty image file in the 'imageFile' form field.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (!MediaTypeHeaderValue.TryParse(imageFile.ContentType, out var parsedContentType) ||
            string.IsNullOrWhiteSpace(parsedContentType.MediaType) ||
            !SupportedImageMimeTypes.Contains(parsedContentType.MediaType))
        {
            return TypedResults.Problem(
                title: "Unsupported image MIME type",
                detail: $"Supported MIME types: {string.Join(", ", SupportedImageMimeTypes)}.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (imageFile.Length > MaxImageUploadBytes)
        {
            return TypedResults.Problem(
                title: "Image file is too large",
                detail: $"Maximum upload size is {MaxImageUploadBytes} bytes.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        await using var imageStream = imageFile.OpenReadStream();
        var result = await sender.Send(
            new ParseBeanImageCommand(imageStream, parsedContentType.MediaType),
            cancellationToken);

        return TypedResults.Ok(ParseBeanImageResponse.FromResult(result));
    }
}
