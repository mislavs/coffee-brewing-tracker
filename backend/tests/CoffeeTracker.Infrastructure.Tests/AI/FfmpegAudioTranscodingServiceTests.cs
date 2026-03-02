using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;
using FluentAssertions;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class FfmpegAudioTranscodingServiceTests
{
    [Fact]
    public async Task ConvertToWaveAsync_WhenFfmpegIsMissing_ShouldThrowHelpfulError()
    {
        // Arrange
        var aiSettings = Options.Create(new AiSettings
        {
            Transcription = new TranscriptionSettings
            {
                MaxAudioDurationSeconds = 45
            }
        });
        var service = new FfmpegAudioTranscodingService(
            aiSettings,
            ffmpegExecutablePath: "ffmpeg-does-not-exist-12345");

        // Act
        Func<Task> action = async () => _ = await service.ConvertToWaveAsync(new MemoryStream([1, 2, 3]), TestContext.Current.CancellationToken);

        // Assert
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*ffmpeg*PATH*");
    }
}
