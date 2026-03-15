using CoffeeTracker.Api.Contracts.BrewLogs;
using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;
using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Application.Features.BrewLog.Queries;
using CoffeeTracker.Infrastructure.AI;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;

namespace CoffeeTracker.Api.Endpoints;

public static class BrewLogEndpoints
{
    private const int DefaultMaxUploadBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> SupportedAudioMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "audio/webm",
        "audio/ogg",
        "audio/wav",
        "audio/mp4",
        "audio/mpeg"
    };

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

        group.MapPost("/parse-voice", ParseVoiceBrewLog)
            .WithName("ParseVoiceBrewLog")
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ParseVoiceBrewLogResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

        return app;
    }

    private static async Task<Ok<IReadOnlyList<BrewLogSummaryDto>>> GetBrewLogs(
        string? search,
        Guid? beanId,
        DateTime? dateFrom,
        DateTime? dateTo,
        bool? includeUnavailableBeans,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var brewLogs = await sender.Send(
            new GetBrewLogsListQuery(search, beanId, dateFrom, dateTo, includeUnavailableBeans ?? false),
            cancellationToken);
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
        var result = await sender.Send(
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
                           new { id = result.Id }) ??
                       $"/api/brew-logs/{result.Id}";

        return TypedResults.Created(location, new CreateBrewLogResponse(result.Id, result.RemainingBeanQuantity));
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

    private static async Task<Results<Ok<ParseVoiceBrewLogResponse>, ProblemHttpResult>> ParseVoiceBrewLog(
        IFormFile? audioFile,
        IOptions<AiSettings> aiSettingsOptions,
        IAiFeatureAvailability aiFeatureAvailability,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (!aiFeatureAvailability.IsVoiceBrewLogParsingAvailable)
        {
            return TypedResults.Problem(
                title: "Voice brew log parsing is unavailable",
                detail: "Configure both AI transcription and extraction providers to enable this endpoint.",
                statusCode: StatusCodes.Status501NotImplemented);
        }

        if (audioFile is null || audioFile.Length == 0)
        {
            return TypedResults.Problem(
                title: "Audio file is required",
                detail: "Provide a non-empty audio file in the 'audioFile' form field.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (!MediaTypeHeaderValue.TryParse(audioFile.ContentType, out var parsedContentType) ||
            string.IsNullOrWhiteSpace(parsedContentType.MediaType) ||
            !SupportedAudioMimeTypes.Contains(parsedContentType.MediaType))
        {
            return TypedResults.Problem(
                title: "Unsupported audio MIME type",
                detail: $"Supported MIME types: {string.Join(", ", SupportedAudioMimeTypes)}.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var maxUploadBytes = aiSettingsOptions.Value.Transcription.MaxUploadBytes;
        maxUploadBytes = maxUploadBytes > 0 ? maxUploadBytes : DefaultMaxUploadBytes;

        if (audioFile.Length > maxUploadBytes)
        {
            return TypedResults.Problem(
                title: "Audio file is too large",
                detail: $"Maximum upload size is {maxUploadBytes} bytes.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        await using var audioStream = audioFile.OpenReadStream();
        var result = await sender.Send(
            new ParseVoiceBrewLogCommand(audioStream),
            cancellationToken);

        return TypedResults.Ok(ParseVoiceBrewLogResponse.FromResult(result));
    }
}
