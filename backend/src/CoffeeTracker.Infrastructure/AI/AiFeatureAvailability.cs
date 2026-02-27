using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class AiFeatureAvailability(IOptions<AiSettings> aiSettings) : IAiFeatureAvailability
{
    public bool IsVoiceBrewLogParsingAvailable { get; } = ResolveAvailability(aiSettings);

    private static bool IsImplementedTranscriptionProvider(string? provider) =>
        !string.IsNullOrWhiteSpace(provider) &&
        provider.Equals(AiProviders.Transcription.WhisperCpp, StringComparison.OrdinalIgnoreCase);

    private static bool IsImplementedExtractionProvider(string? provider) =>
        !string.IsNullOrWhiteSpace(provider) &&
        provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase);

    private static bool ResolveAvailability(IOptions<AiSettings> settings)
    {
        ArgumentNullException.ThrowIfNull(settings);
        return IsImplementedTranscriptionProvider(settings.Value.Transcription.Provider) &&
               IsImplementedExtractionProvider(settings.Value.Extraction.Provider);
    }
}
