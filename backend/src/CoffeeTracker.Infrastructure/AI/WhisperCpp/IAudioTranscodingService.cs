namespace CoffeeTracker.Infrastructure.AI.WhisperCpp;

public interface IAudioTranscodingService
{
    Task<MemoryStream> ConvertToWaveAsync(Stream audioSpeechStream, CancellationToken cancellationToken);
}
