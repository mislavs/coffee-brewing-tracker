using CoffeeTracker.Infrastructure.AI;
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
        var aiSettings = Options.Create(new AiSettings
        {
            Transcription = new TranscriptionSettings
            {
                Provider = AiProviders.Transcription.WhisperCpp
            },
            Extraction = new ExtractionSettings
            {
                Provider = AiProviders.Extraction.OpenRouter
            }
        });

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: fakeFfmpeg.Path);

        // Assert
        sut.IsVoiceBrewLogParsingAvailable.Should().BeTrue();
    }

    [Fact]
    public void IsVoiceBrewLogParsingAvailable_WhenProviderIsNotConfigured_ShouldBeFalse()
    {
        // Arrange
        var aiSettings = Options.Create(new AiSettings
        {
            Transcription = new TranscriptionSettings
            {
                Provider = null
            },
            Extraction = new ExtractionSettings
            {
                Provider = AiProviders.Extraction.OpenRouter
            }
        });

        // Act
        var sut = new AiFeatureAvailability(
            aiSettings,
            NullLogger<AiFeatureAvailability>.Instance,
            ffmpegExecutablePath: "ffmpeg");

        // Assert
        sut.IsVoiceBrewLogParsingAvailable.Should().BeFalse();
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
