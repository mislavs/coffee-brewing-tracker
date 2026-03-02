using System.ComponentModel;
using System.Diagnostics;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;

public sealed class FfmpegAudioTranscodingService(
    IOptions<AiSettings> aiSettings,
    string ffmpegExecutablePath = "ffmpeg") : IAudioTranscodingService
{
    private readonly string _ffmpegExecutablePath = ValidateExecutablePath(ffmpegExecutablePath);
    private readonly int _maxAudioDurationSeconds = ResolveMaxAudioDurationSeconds(aiSettings);

    public async Task<MemoryStream> ConvertToWaveAsync(Stream audioSpeechStream, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(audioSpeechStream);

        var ffmpeg = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = _ffmpegExecutablePath,
                Arguments = $"-i pipe:0 -t {_maxAudioDurationSeconds} -ar 16000 -ac 1 -f wav pipe:1",
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        var outputStream = new MemoryStream();

        try
        {
            try
            {
                if (!ffmpeg.Start())
                {
                    throw new InvalidOperationException("Failed to start ffmpeg process.");
                }
            }
            catch (Win32Exception exception)
            {
                throw new InvalidOperationException(
                    "Failed to start ffmpeg process. Ensure ffmpeg is installed and available on PATH.",
                    exception);
            }

            var readErrorTask = ffmpeg.StandardError.ReadToEndAsync();
            var writeInputTask = PipeAudioToFfmpegAsync(audioSpeechStream, ffmpeg, cancellationToken);
            var readOutputTask = ffmpeg.StandardOutput.BaseStream.CopyToAsync(outputStream, cancellationToken);
            var waitForExitTask = ffmpeg.WaitForExitAsync(cancellationToken);

            await Task.WhenAll(writeInputTask, readOutputTask, waitForExitTask);

            var ffmpegError = await readErrorTask;
            if (ffmpeg.ExitCode != 0)
            {
                throw new InvalidOperationException(
                    $"ffmpeg exited with code {ffmpeg.ExitCode}. stderr: {ffmpegError}");
            }

            outputStream.Position = 0;
            return outputStream;
        }
        catch
        {
            outputStream.Dispose();
            throw;
        }
        finally
        {
            TryKill(ffmpeg);
            ffmpeg.Dispose();
        }
    }

    private static async Task PipeAudioToFfmpegAsync(
        Stream audioSpeechStream,
        Process ffmpeg,
        CancellationToken cancellationToken)
    {
        try
        {
            await audioSpeechStream.CopyToAsync(ffmpeg.StandardInput.BaseStream, cancellationToken);
            ffmpeg.StandardInput.Close();
        }
        catch (IOException) when (ffmpeg.HasExited)
        {
            // If ffmpeg exited early (for example due to invalid args/input), ignore broken pipe here.
        }
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
            // Ignore cleanup exceptions.
        }
    }

    private static string ValidateExecutablePath(string executablePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(executablePath);
        return executablePath;
    }

    private static int ResolveMaxAudioDurationSeconds(IOptions<AiSettings> settings)
    {
        ArgumentNullException.ThrowIfNull(settings);
        var configuredMaxAudioDurationSeconds = settings.Value.Transcription.MaxAudioDurationSeconds;
        return configuredMaxAudioDurationSeconds > 0 ? configuredMaxAudioDurationSeconds : 45;
    }
}
