using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Text;
using Whisper.net;

namespace CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;

public sealed class WhisperCppSpeechToTextClient : ISpeechToTextClient
{
    private const string TranscriptionLanguage = "en";

    private readonly WhisperFactory? _whisperFactory;
    private readonly WhisperProcessor? _processor;
    private readonly ILogger<WhisperCppSpeechToTextClient> _logger;
    private readonly TimeSpan _processingTimeout;
    private readonly IAudioTranscodingService _audioTranscodingService;
    private readonly Func<Stream, CancellationToken, Task<string>> _transcriber;

    public WhisperCppSpeechToTextClient(
        string modelPath,
        int processingTimeoutSeconds,
        ILogger<WhisperCppSpeechToTextClient> logger,
        IAudioTranscodingService audioTranscodingService)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(modelPath);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(audioTranscodingService);

        if (!File.Exists(modelPath))
        {
            throw new FileNotFoundException(
                $"Whisper.cpp model file was not found at '{modelPath}'. Configure AI:Transcription:ModelPath with a valid model file path.",
                modelPath);
        }

        _logger = logger;
        _processingTimeout = TimeSpan.FromSeconds(processingTimeoutSeconds > 0 ? processingTimeoutSeconds : 30);
        _audioTranscodingService = audioTranscodingService;

        _whisperFactory = WhisperFactory.FromPath(modelPath);
        _processor = _whisperFactory
            .CreateBuilder()
            .WithLanguage(TranscriptionLanguage)
            .Build();

        _transcriber = TranscribeWithProcessorAsync;
    }

    internal WhisperCppSpeechToTextClient(
        int processingTimeoutSeconds,
        ILogger<WhisperCppSpeechToTextClient> logger,
        IAudioTranscodingService audioTranscodingService,
        Func<Stream, CancellationToken, Task<string>> transcriber,
        WhisperFactory? whisperFactory = null,
        WhisperProcessor? whisperProcessor = null)
    {
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(audioTranscodingService);
        ArgumentNullException.ThrowIfNull(transcriber);

        _logger = logger;
        _processingTimeout = TimeSpan.FromSeconds(processingTimeoutSeconds > 0 ? processingTimeoutSeconds : 30);
        _audioTranscodingService = audioTranscodingService;
        _transcriber = transcriber;
        _whisperFactory = whisperFactory;
        _processor = whisperProcessor;
    }

    public async Task<SpeechToTextResponse> GetTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(audioSpeechStream);

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(_processingTimeout);
        var processingToken = timeoutCts.Token;

        try
        {
            await using var wavStream = await _audioTranscodingService.ConvertToWaveAsync(audioSpeechStream, processingToken);
            var transcript = await _transcriber(wavStream, processingToken);
            return new SpeechToTextResponse(transcript);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(
                "Whisper transcription timed out after {TimeoutSeconds} seconds.",
                _processingTimeout.TotalSeconds);
            throw new TimeoutException(
                $"Audio processing exceeded timeout of {_processingTimeout.TotalSeconds:0} seconds.");
        }
    }

    public IAsyncEnumerable<SpeechToTextResponseUpdate> GetStreamingTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default) =>
        throw new NotSupportedException("Streaming transcription is not implemented for whisper.cpp.");

    public object? GetService(Type serviceType, object? serviceKey = null)
    {
        ArgumentNullException.ThrowIfNull(serviceType);
        return serviceKey is null && serviceType.IsInstanceOfType(this) ? this : null;
    }

    public void Dispose()
    {
        _processor?.Dispose();
        _whisperFactory?.Dispose();
    }

    private async Task<string> TranscribeWithProcessorAsync(Stream wavStream, CancellationToken cancellationToken)
    {
        var processor = _processor
            ?? throw new InvalidOperationException("Whisper processor is not initialized.");

        var transcript = new StringBuilder();
        await foreach (var segment in processor.ProcessAsync(wavStream, cancellationToken))
        {
            var text = segment.Text;
            if (string.IsNullOrWhiteSpace(text))
            {
                continue;
            }

            if (transcript.Length > 0)
            {
                transcript.Append(' ');
            }

            transcript.Append(text.Trim());
        }

        return transcript.ToString();
    }
}
