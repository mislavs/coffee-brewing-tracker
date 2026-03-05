using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Transcription;
using CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;
using FluentAssertions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class SpeechToTextClientFactoryTests
{
    private readonly ILogger<SpeechToTextClientFactory> _logger =
        Substitute.For<ILogger<SpeechToTextClientFactory>>();
    private readonly ILogger<WhisperCppSpeechToTextClient> _whisperLogger =
        Substitute.For<ILogger<WhisperCppSpeechToTextClient>>();
    private readonly IAudioTranscodingService _audioTranscodingService =
        Substitute.For<IAudioTranscodingService>();
    private readonly IHostEnvironment _hostEnvironment =
        Substitute.For<IHostEnvironment>();

    [Fact]
    public void Create_WhenProviderIsMissing_ReturnsNullSpeechToTextClient()
    {
        // Arrange
        var sut = CreateFactory(provider: null);

        // Act
        var client = sut.Create();

        // Assert
        client.Should().BeOfType<NullSpeechToTextClient>();
    }

    [Fact]
    public void Create_WhenProviderIsKnownButNotImplemented_ReturnsNullSpeechToTextClient()
    {
        // Arrange
        var sut = CreateFactory(provider: AiProviders.Transcription.OpenAi);

        // Act
        var client = sut.Create();

        // Assert
        client.Should().BeOfType<NullSpeechToTextClient>();
    }

    [Fact]
    public void Create_WhenProviderIsUnknown_ReturnsNullSpeechToTextClient()
    {
        // Arrange
        var sut = CreateFactory(provider: "OtherProvider");

        // Act
        var client = sut.Create();

        // Assert
        client.Should().BeOfType<NullSpeechToTextClient>();
    }

    [Fact]
    public void Create_WhenWhisperProviderAndModelPathMissing_ThrowsInvalidOperationException()
    {
        // Arrange
        var sut = CreateFactory(
            provider: AiProviders.Transcription.WhisperCpp,
            modelPath: null);

        // Act
        Action act = () => sut.Create();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*AI:Transcription:ModelPath must be configured*");
    }

    [Fact]
    public void Create_WhenWhisperProviderAndModelPathIsRelative_ResolvesAgainstContentRoot()
    {
        // Arrange
        const string relativePath = "models/ggml-base.bin";
        var contentRoot = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N"));
        var expectedPath = Path.GetFullPath(Path.Combine(contentRoot, relativePath));

        var sut = CreateFactory(
            provider: AiProviders.Transcription.WhisperCpp,
            modelPath: relativePath,
            contentRootPath: contentRoot);

        // Act
        Action act = () => sut.Create();

        // Assert
        act.Should().Throw<FileNotFoundException>()
            .Where(exception => exception.FileName == expectedPath);
    }

    [Fact]
    public void Create_WhenWhisperProviderAndModelPathIsAbsolute_UsesConfiguredPath()
    {
        // Arrange
        var absolutePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.bin");
        _hostEnvironment.ContentRootPath.Returns(Path.GetTempPath());

        var sut = CreateFactory(
            provider: AiProviders.Transcription.WhisperCpp,
            modelPath: absolutePath);

        // Act
        Action act = () => sut.Create();

        // Assert
        act.Should().Throw<FileNotFoundException>()
            .Where(exception => exception.FileName == absolutePath);
    }

    private SpeechToTextClientFactory CreateFactory(
        string? provider,
        string? modelPath = "model.bin",
        string? contentRootPath = null)
    {
        _hostEnvironment.ContentRootPath.Returns(contentRootPath ?? Path.GetTempPath());

        var options = Options.Create(new AiSettings
        {
            Transcription = new TranscriptionSettings
            {
                Provider = provider,
                ModelPath = modelPath,
                ProcessingTimeoutSeconds = 10
            }
        });

        return new SpeechToTextClientFactory(
            options,
            _logger,
            _whisperLogger,
            _audioTranscodingService,
            _hostEnvironment);
    }
}
