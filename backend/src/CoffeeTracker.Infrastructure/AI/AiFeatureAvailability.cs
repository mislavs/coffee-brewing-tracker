using System.ComponentModel;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class AiFeatureAvailability(
    IOptions<AiSettings> aiSettings,
    ILogger<AiFeatureAvailability> logger,
    string ffmpegExecutablePath = "ffmpeg") : IAiFeatureAvailability
{
    public bool IsVoiceBrewLogParsingAvailable { get; } = ResolveAvailability(aiSettings, logger, ffmpegExecutablePath);

    private static bool IsImplementedTranscriptionProvider(string? provider) =>
        !string.IsNullOrWhiteSpace(provider) &&
        provider.Equals(AiProviders.Transcription.WhisperCpp, StringComparison.OrdinalIgnoreCase);

    private static bool IsImplementedExtractionProvider(string? provider) =>
        !string.IsNullOrWhiteSpace(provider) &&
        provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase);

    private static bool ResolveAvailability(
        IOptions<AiSettings> settings,
        ILogger<AiFeatureAvailability> logger,
        string ffmpegExecutablePath)
    {
        ArgumentNullException.ThrowIfNull(settings);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentException.ThrowIfNullOrWhiteSpace(ffmpegExecutablePath);

        var isTranscriptionProviderAvailable = IsImplementedTranscriptionProvider(settings.Value.Transcription.Provider);
        var isExtractionProviderAvailable = IsImplementedExtractionProvider(settings.Value.Extraction.Provider);
        if (!isTranscriptionProviderAvailable || !isExtractionProviderAvailable)
        {
            return false;
        }

        var isFfmpegAvailable = IsFfmpegAvailable(ffmpegExecutablePath);
        if (!isFfmpegAvailable)
        {
            logger.LogWarning("ffmpeg is not available on PATH. Voice brew log parsing will be disabled.");
        }

        return isFfmpegAvailable;
    }

    private static bool IsFfmpegAvailable(string ffmpegExecutablePath)
    {
        using var ffmpeg = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = ffmpegExecutablePath,
                Arguments = "-version",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        try
        {
            if (!ffmpeg.Start())
            {
                return false;
            }
        }
        catch (Win32Exception)
        {
            return false;
        }

        const int probeTimeoutMilliseconds = 5_000;
        if (!ffmpeg.WaitForExit(probeTimeoutMilliseconds))
        {
            TryKill(ffmpeg);
            return false;
        }

        return ffmpeg.ExitCode == 0;
    }

    private static void TryKill(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch
        {
            // Ignore cleanup errors.
        }
    }
}
