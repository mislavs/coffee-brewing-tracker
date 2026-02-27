using CoffeeTracker.Infrastructure.AI.WhisperCpp;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class WhisperCppSpeechToTextClientTests
{
    private readonly ILogger<WhisperCppSpeechToTextClient> _logger = Substitute.For<ILogger<WhisperCppSpeechToTextClient>>();
    private readonly IAudioTranscodingService _audioTranscodingService = Substitute.For<IAudioTranscodingService>();

    [Fact]
    public void Constructor_WhenModelPathIsMissing_ShouldThrowFileNotFoundException()
    {
        // Arrange
        var missingPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.bin");

        // Act
        Action action = () => _ = new WhisperCppSpeechToTextClient(
            missingPath,
            processingTimeoutSeconds: 30,
            _logger,
            _audioTranscodingService);

        // Assert
        action.Should().Throw<FileNotFoundException>()
            .WithMessage("*ModelPath*");
    }

    [Fact]
    public void Constructor_WhenModelPathIsWhitespace_ShouldThrowArgumentException()
    {
        // Act
        Action action = () => _ = new WhisperCppSpeechToTextClient(
            "   ",
            processingTimeoutSeconds: 30,
            _logger,
            _audioTranscodingService);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public async Task GetTextAsync_WhenProcessingTimesOut_ShouldThrowTimeoutException()
    {
        // Arrange
        using var sut = new WhisperCppSpeechToTextClient(
            processingTimeoutSeconds: 1,
            logger: _logger,
            audioTranscodingService: _audioTranscodingService,
            transcriber: async (_, cancellationToken) =>
            {
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                return "transcript";
            });
        _audioTranscodingService
            .ConvertToWaveAsync(Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new MemoryStream()));

        // Act
        Func<Task> action = async () => _ = await sut.GetTextAsync(new MemoryStream([1, 2, 3]));

        // Assert
        await action.Should().ThrowAsync<TimeoutException>();
    }

    [Fact]
    public async Task GetTextAsync_WhenCallerCancels_ShouldThrowOperationCanceledException()
    {
        // Arrange
        using var cancellationTokenSource = new CancellationTokenSource();
        using var sut = new WhisperCppSpeechToTextClient(
            processingTimeoutSeconds: 30,
            logger: _logger,
            audioTranscodingService: _audioTranscodingService,
            transcriber: async (_, cancellationToken) =>
            {
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                return "transcript";
            });
        _audioTranscodingService
            .ConvertToWaveAsync(Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new MemoryStream()));

        cancellationTokenSource.CancelAfter(TimeSpan.FromMilliseconds(100));

        // Act
        Func<Task> action = async () => _ = await sut.GetTextAsync(
            new MemoryStream([1, 2, 3]),
            cancellationToken: cancellationTokenSource.Token);

        // Assert
        await action.Should().ThrowAsync<OperationCanceledException>();
    }
}
