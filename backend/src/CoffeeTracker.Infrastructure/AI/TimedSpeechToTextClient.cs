using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class TimedSpeechToTextClient(
    ISpeechToTextClient _inner,
    ILogger<TimedSpeechToTextClient> _logger) : ISpeechToTextClient
{
    public async Task<SpeechToTextResponse> GetTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        using var activity = VoiceAiTracing.ActivitySource.StartActivity(
            "voice.transcription",
            ActivityKind.Internal);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await _inner.GetTextAsync(audioSpeechStream, options, cancellationToken);
            stopwatch.Stop();

            var transcriptLength = response.Text?.Length ?? 0;
            activity?.SetTag("voice.transcription.duration_ms", stopwatch.ElapsedMilliseconds);
            activity?.SetTag("voice.transcription.transcript_length", transcriptLength);

            _logger.LogInformation(
                "Voice transcription completed in {DurationMs} ms. Transcript length: {TranscriptLength}.",
                stopwatch.ElapsedMilliseconds,
                transcriptLength);

            return response;
        }
        catch (Exception exception)
        {
            stopwatch.Stop();
            activity?.SetTag("voice.transcription.duration_ms", stopwatch.ElapsedMilliseconds);
            activity?.SetStatus(ActivityStatusCode.Error, exception.Message);

            _logger.LogWarning(
                exception,
                "Voice transcription failed after {DurationMs} ms.",
                stopwatch.ElapsedMilliseconds);

            throw;
        }
    }

    public IAsyncEnumerable<SpeechToTextResponseUpdate> GetStreamingTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default) =>
        _inner.GetStreamingTextAsync(audioSpeechStream, options, cancellationToken);

    public object? GetService(Type serviceType, object? serviceKey = null) =>
        _inner.GetService(serviceType, serviceKey);

    public void Dispose()
    {
        if (_inner is IDisposable disposable)
        {
            disposable.Dispose();
        }
    }
}
