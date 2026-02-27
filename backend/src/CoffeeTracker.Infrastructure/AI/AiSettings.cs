namespace CoffeeTracker.Infrastructure.AI;

public sealed class AiSettings
{
    public const string SectionName = "AI";

    public TranscriptionSettings Transcription { get; init; } = new();
    public ExtractionSettings Extraction { get; init; } = new();
}

public static class AiProviders
{
    public static class Transcription
    {
        public const string WhisperCpp = "WhisperCpp";
        public const string OpenAi = "OpenAI";
    }

    public static class Extraction
    {
        public const string OpenRouter = "OpenRouter";
        public const string OpenAi = "OpenAI";
    }
}

public static class AiProviderDefaults
{
    public const string OpenRouterEndpoint = "https://openrouter.ai/api/v1";
}

public sealed class TranscriptionSettings
{
    public string? Provider { get; init; }
    public string? ModelPath { get; init; }
    public int MaxUploadBytes { get; init; } = 10 * 1024 * 1024;
    public int MaxAudioDurationSeconds { get; init; } = 45;
    public int ProcessingTimeoutSeconds { get; init; } = 30;
}

public sealed class ExtractionSettings
{
    public string? Provider { get; init; }
    public string? ApiKey { get; init; }
    public string? Endpoint { get; init; }
    public string? Model { get; init; }
}
