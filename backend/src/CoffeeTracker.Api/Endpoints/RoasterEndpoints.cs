using CoffeeTracker.Api.Contracts.Roasters;
using CoffeeTracker.Application.Common.Images;
using CoffeeTracker.Application.Features.Roasters.Commands;
using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Application.Features.Roasters.Queries;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CoffeeTracker.Api.Endpoints;

public static class RoasterEndpoints
{
    private static readonly HashSet<string> SupportedLogoMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml"
    };

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

        group.MapDelete("/{id:guid}", DeleteRoaster)
            .WithName("DeleteRoaster");

        group.MapPut("/{id:guid}/logo", UploadRoasterLogo)
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .WithMetadata(new RequestSizeLimitAttribute(RoasterLogoLimits.MaxRequestBodySizeBytes))
            .WithName("UploadRoasterLogo");

        group.MapGet("/{id:guid}/logo", GetRoasterLogo)
            .WithName("GetRoasterLogo");

        group.MapDelete("/{id:guid}/logo", DeleteRoasterLogo)
            .WithName("DeleteRoasterLogo");

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
            new CreateRoasterCommand(request.Name, request.City, request.CountryId, request.WebsiteUrl),
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
            new UpdateRoasterCommand(id, request.Name, request.City, request.CountryId, request.WebsiteUrl),
            cancellationToken);

        return TypedResults.Ok();
    }

    private static async Task<NoContent> DeleteRoaster(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteRoasterCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }

    private static async Task<NoContent> UploadRoasterLogo(
        Guid id,
        IFormFile? file,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            throw BuildValidationException("file", "Logo image is required.");
        }

        if (file.Length <= 0)
        {
            throw BuildValidationException("file", "Logo image cannot be empty.");
        }

        if (file.Length > RoasterLogoLimits.MaxLogoSizeBytes)
        {
            throw BuildValidationException("file", "Logo image must be 512 KB or smaller.");
        }

        if (!ImageMediaTypeParser.TryParse(file.ContentType, SupportedLogoMimeTypes, out var mediaType))
        {
            throw BuildValidationException("file", "Logo must be a PNG, JPEG, WebP, or SVG image.");
        }

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);

        await sender.Send(
            new UploadRoasterLogoCommand(id, file.FileName, mediaType, stream.ToArray()),
            cancellationToken);

        return TypedResults.NoContent();
    }

    private static async Task<IResult> GetRoasterLogo(
        Guid id,
        ISender sender,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var logo = await sender.Send(new GetRoasterLogoQuery(id), cancellationToken);

        context.Response.Headers.CacheControl = "public,max-age=86400";
        return Results.File(logo.Data, logo.ContentType, logo.FileName);
    }

    private static async Task<NoContent> DeleteRoasterLogo(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteRoasterLogoCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }

    private static ValidationException BuildValidationException(string propertyName, string errorMessage)
    {
        return new ValidationException(
            [new ValidationFailure(propertyName, errorMessage)]);
    }
}
