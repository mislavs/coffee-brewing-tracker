using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Extraction;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class AiFeatureAvailabilityTests
{
    [Fact]
    public void IsVoiceBrewLogParsingAvailable_WhenProvidersConfiguredAndExecutableRuns_ShouldBeTrue()
    {
        // Arrange
        using var fakeFfmpeg = FakeExecutable.Create(returnCode: 0);
        var aiSettings = CreateSettings(
            extractionProvider: AiProviders.Extraction.OpenRouter,
            extractionApiKey: "test-key",
            extractionModel: "test-model",
            extractionEndpoint: "https://openrouter.ai/api/v1");
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: fakeFfmpeg.Path);

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeTrue();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeTrue();
    }

    [Fact]
    public void IsImageBeanParsingAvailable_WhenExtractionProviderMissing_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = CreateSettings(extractionProvider: null);
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    [Fact]
    public void IsImageBeanParsingAvailable_WhenExtractionProviderUnsupported_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = CreateSettings(extractionProvider: "UnsupportedProvider");
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    [Fact]
    public void IsImageBeanParsingAvailable_WhenExtractionApiKeyMissing_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = CreateSettings(
            extractionProvider: AiProviders.Extraction.OpenRouter,
            extractionApiKey: null,
            extractionModel: "test-model",
            extractionEndpoint: "https://openrouter.ai/api/v1");
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    [Fact]
    public void IsImageBeanParsingAvailable_WhenExtractionModelMissing_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = CreateSettings(
            extractionProvider: AiProviders.Extraction.OpenRouter,
            extractionApiKey: "test-key",
            extractionModel: null,
            extractionEndpoint: "https://openrouter.ai/api/v1");
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    [Fact]
    public void IsImageBeanParsingAvailable_WhenExtractionEndpointInvalid_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = CreateSettings(
            extractionProvider: AiProviders.Extraction.OpenRouter,
            extractionApiKey: "test-key",
            extractionModel: "test-model",
            extractionEndpoint: "not-a-valid-uri");
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    [Fact]
    public void IsVoiceBrewLogParsingAvailable_WhenImageExtractionNotOperable_ShouldBeFalse()
    {
        // Arrange
        using var fakeFfmpeg = FakeExecutable.Create(returnCode: 0);
        var aiSettings = CreateSettings(
            extractionProvider: null,
            transcriptionProvider: AiProviders.Transcription.WhisperCpp);
        var chatClientFactory = new ChatClientFactory(aiSettings, NullLogger<ChatClientFactory>.Instance);

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            chatClientFactory,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: fakeFfmpeg.Path);

        // Assert
        sut.IsImageBeanParsingAvailable.Should().BeFalse();
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
    }

    private static IOptions<AiSettings> CreateSettings(
        string? extractionProvider = AiProviders.Extraction.OpenRouter,
        string? extractionApiKey = "test-key",
        string? extractionModel = "test-model",
        string? extractionEndpoint = "https://openrouter.ai/api/v1",
        string? transcriptionProvider = AiProviders.Transcription.WhisperCpp)
    {
        return Options.Create(new AiSettings
        {
            Transcription = new TranscriptionSettings
            {
                Provider = transcriptionProvider
            },
            Extraction = new ExtractionSettings
            {
                Provider = extractionProvider,
                ApiKey = extractionApiKey,
                Model = extractionModel,
                Endpoint = extractionEndpoint
            }
        });
    }

    private sealed class FakeExecutable(string path, string directoryPath) : IDisposable
    {
        public string Path { get; } = path;

        public static FakeExecutable Create(int returnCode)
        {
            var directoryPath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(directoryPath);

            var executablePath = OperatingSystem.IsWindows()
                ? System.IO.Path.Combine(directoryPath, "fake-ffmpeg.cmd")
                : System.IO.Path.Combine(directoryPath, "fake-ffmpeg");
            var script = OperatingSystem.IsWindows()
                ? $"@echo off{Environment.NewLine}exit /b {returnCode}{Environment.NewLine}"
                : $"#!/usr/bin/env sh{Environment.NewLine}exit {returnCode}{Environment.NewLine}";

            File.WriteAllText(executablePath, script);
            if (!OperatingSystem.IsWindows())
            {
                File.SetUnixFileMode(
                    executablePath,
                    UnixFileMode.UserRead |
                    UnixFileMode.UserWrite |
                    UnixFileMode.UserExecute);
            }

            return new FakeExecutable(executablePath, directoryPath);
        }

        public void Dispose()
        {
            if (Directory.Exists(directoryPath))
            {
                Directory.Delete(directoryPath, recursive: true);
            }
        }
    }
}
