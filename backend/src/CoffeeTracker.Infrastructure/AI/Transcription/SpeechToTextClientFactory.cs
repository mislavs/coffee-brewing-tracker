using CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.AI.Transcription;

public sealed class SpeechToTextClientFactory(
    IOptions<AiSettings> _aiSettings,
    ILogger<SpeechToTextClientFactory> _logger,
    ILogger<WhisperCppSpeechToTextClient> _whisperLogger,
    IAudioTranscodingService _audioTranscodingService,
    IHostEnvironment _hostEnvironment)
{
    public ISpeechToTextClient Create()
    {
        var settings = _aiSettings.Value;
        var provider = settings.Transcription.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            return new NullSpeechToTextClient();
        }

        if (provider.Equals(AiProviders.Transcription.WhisperCpp, StringComparison.OrdinalIgnoreCase))
        {
            var modelPath = ResolveWhisperModelPath(
                settings.Transcription.ModelPath,
                _hostEnvironment.ContentRootPath);

            return new WhisperCppSpeechToTextClient(
                modelPath,
                settings.Transcription.ProcessingTimeoutSeconds,
                _whisperLogger,
                _audioTranscodingService);
        }

        if (IsKnownTranscriptionProvider(provider))
        {
            _logger.LogWarning(
                "AI transcription provider '{Provider}' is known but not implemented yet. Falling back to NullSpeechToTextClient.",
                provider);
        }
        else
        {
            _logger.LogWarning(
                "Unsupported AI transcription provider '{Provider}'. Falling back to NullSpeechToTextClient.",
                provider);
        }

        return new NullSpeechToTextClient();
    }

    private static bool IsKnownTranscriptionProvider(string provider) =>
        provider.Equals(AiProviders.Transcription.WhisperCpp, StringComparison.OrdinalIgnoreCase) ||
        provider.Equals(AiProviders.Transcription.OpenAi, StringComparison.OrdinalIgnoreCase);

    private static string ResolveWhisperModelPath(string? configuredModelPath, string contentRootPath)
    {
        if (string.IsNullOrWhiteSpace(configuredModelPath))
        {
            throw new InvalidOperationException(
                $"AI:Transcription:ModelPath must be configured when AI:Transcription:Provider is set to {AiProviders.Transcription.WhisperCpp}.");
        }

        return Path.IsPathRooted(configuredModelPath)
            ? configuredModelPath
            : Path.GetFullPath(Path.Combine(contentRootPath, configuredModelPath));
    }
}
