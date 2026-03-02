namespace CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;

public interface IAudioTranscodingService
{
    Task<MemoryStream> ConvertToWaveAsync(Stream audioSpeechStream, CancellationToken cancellationToken);
}
