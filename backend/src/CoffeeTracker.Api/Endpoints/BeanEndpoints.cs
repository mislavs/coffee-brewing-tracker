using CoffeeTracker.Api.Contracts.Beans;
using CoffeeTracker.Application.Common.Images;
using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Infrastructure.AI;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace CoffeeTracker.Api.Endpoints;

public static class BeanEndpoints
{
    private const int MaxParseImageUploadBytes = 10 * 1024 * 1024;

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

        group.MapPut("/{id:guid}/image", UploadBeanImage)
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .WithMetadata(new RequestSizeLimitAttribute(BeanImageLimits.MaxRequestBodySizeBytes))
            .WithName("UploadBeanImage");

        group.MapGet("/{id:guid}/image", GetBeanImage)
            .WithName("GetBeanImage");

        group.MapDelete("/{id:guid}/image", DeleteBeanImage)
            .WithName("DeleteBeanImage");

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
                request.FlavorNoteNames,
                request.Region,
                request.Rating,
                request.Notes),
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
                request.FlavorNoteNames,
                request.Region,
                request.Rating,
                request.Notes),
            cancellationToken);

        return TypedResults.Ok();
    }

    private static async Task<NoContent> UploadBeanImage(
        Guid id,
        IFormFile? file,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            throw BuildValidationException("file", "Bean image is required.");
        }

        if (file.Length <= 0)
        {
            throw BuildValidationException("file", "Bean image cannot be empty.");
        }

        if (file.Length > BeanImageLimits.MaxImageSizeBytes)
        {
            throw BuildValidationException("file", "Bean image must be 5 MB or smaller.");
        }

        if (!ImageMediaTypeParser.TryParse(file.ContentType, SupportedImageMimeTypes, out var mediaType))
        {
            throw BuildValidationException("file", "Bean image must be a PNG, JPEG, or WebP image.");
        }

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);

        await sender.Send(
            new UploadBeanImageCommand(id, file.FileName, mediaType, stream.ToArray()),
            cancellationToken);

        return TypedResults.NoContent();
    }

    private static async Task<IResult> GetBeanImage(
        Guid id,
        ISender sender,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var image = await sender.Send(new GetBeanImageQuery(id), cancellationToken);

        context.Response.Headers.CacheControl = "public,max-age=86400";
        return Results.File(image.Data, image.ContentType, image.FileName);
    }

    private static async Task<NoContent> DeleteBeanImage(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteBeanImageCommand(id), cancellationToken);
        return TypedResults.NoContent();
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

        if (imageFile.Length > MaxParseImageUploadBytes)
        {
            return TypedResults.Problem(
                title: "Image file is too large",
                detail: $"Maximum upload size is {MaxParseImageUploadBytes} bytes.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        await using var imageStream = imageFile.OpenReadStream();
        var result = await sender.Send(
            new ParseBeanImageCommand(imageStream, parsedContentType.MediaType),
            cancellationToken);

        return TypedResults.Ok(ParseBeanImageResponse.FromResult(result));
    }

    private static ValidationException BuildValidationException(string propertyName, string errorMessage)
    {
        return new ValidationException(
            [new ValidationFailure(propertyName, errorMessage)]);
    }
}
