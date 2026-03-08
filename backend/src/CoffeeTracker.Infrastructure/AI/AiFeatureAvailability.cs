using System.ComponentModel;
using System.Diagnostics;
using CoffeeTracker.Infrastructure.AI.Extraction.Shared;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class AiFeatureAvailability : IAiFeatureAvailability
{
    public AiFeatureAvailability(
        IOptions<AiSettings> aiSettings,
        ChatClientFactory chatClientFactory,
        ILogger<AiFeatureAvailability> logger,
        string ffmpegExecutablePath = "ffmpeg")
    {
        ArgumentNullException.ThrowIfNull(aiSettings);
        ArgumentNullException.ThrowIfNull(chatClientFactory);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentException.ThrowIfNullOrWhiteSpace(ffmpegExecutablePath);

        IsImageBeanParsingAvailable = chatClientFactory.GetAvailability().IsAvailable;
        IsVoiceBrewLogParsingAvailable = ResolveVoiceBrewLogParsingAvailability(
            aiSettings.Value.Transcription.Provider,
            IsImageBeanParsingAvailable,
            logger,
            ffmpegExecutablePath);
    }

    public bool IsImageBeanParsingAvailable { get; }

    public bool IsVoiceBrewLogParsingAvailable { get; }

    private static bool IsImplementedTranscriptionProvider(string? provider) =>
        !string.IsNullOrWhiteSpace(provider) &&
        provider.Equals(AiProviders.Transcription.WhisperCpp, StringComparison.OrdinalIgnoreCase);

    private static bool ResolveVoiceBrewLogParsingAvailability(
        string? transcriptionProvider,
        bool isImageBeanParsingAvailable,
        ILogger<AiFeatureAvailability> logger,
        string ffmpegExecutablePath)
    {
        if (!isImageBeanParsingAvailable || !IsImplementedTranscriptionProvider(transcriptionProvider))
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
