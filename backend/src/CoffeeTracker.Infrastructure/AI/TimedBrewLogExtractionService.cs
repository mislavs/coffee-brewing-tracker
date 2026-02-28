using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class TimedBrewLogExtractionService(
    IBrewLogExtractionService _inner,
    ILogger<TimedBrewLogExtractionService> _logger) : IBrewLogExtractionService
{
    public async Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken)
    {
        using var activity = VoiceAiTracing.ActivitySource.StartActivity(
            "voice.extraction",
            ActivityKind.Internal);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var result = await _inner.ExtractAsync(transcript, catalog, cancellationToken);
            stopwatch.Stop();

            activity?.SetTag("voice.extraction.duration_ms", stopwatch.ElapsedMilliseconds);
            activity?.SetTag("voice.extraction.unmatched_references_count", result.UnmatchedReferences.Count);

            _logger.LogInformation(
                "Voice extraction completed in {DurationMs} ms. Unmatched references: {UnmatchedReferencesCount}.",
                stopwatch.ElapsedMilliseconds,
                result.UnmatchedReferences.Count);

            return result;
        }
        catch (Exception exception)
        {
            stopwatch.Stop();
            activity?.SetTag("voice.extraction.duration_ms", stopwatch.ElapsedMilliseconds);
            activity?.SetStatus(ActivityStatusCode.Error, exception.Message);

            _logger.LogWarning(
                exception,
                "Voice extraction failed after {DurationMs} ms.",
                stopwatch.ElapsedMilliseconds);

            throw;
        }
    }
}
