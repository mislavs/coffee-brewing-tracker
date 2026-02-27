using CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.ParseVoiceBrewLog;

public class ParseVoiceBrewLogValidatorTests
{
    private readonly ParseVoiceBrewLogValidator _sut = new();

    [Theory]
    [InlineData("audio/webm")]
    [InlineData("audio/ogg")]
    [InlineData("audio/wav")]
    [InlineData("audio/mp4")]
    [InlineData("audio/mpeg")]
    public void Validate_WhenContentTypeIsSupported_ShouldNotHaveValidationError(string contentType)
    {
        // Arrange
        var command = new ParseVoiceBrewLogCommand(new MemoryStream([1, 2, 3]), contentType);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenContentTypeIsUnsupported_ShouldHaveValidationError()
    {
        // Arrange
        var command = new ParseVoiceBrewLogCommand(new MemoryStream([1, 2, 3]), "text/plain");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.ContentType);
    }

    [Fact]
    public void Validate_WhenAudioStreamIsNull_ShouldHaveValidationError()
    {
        // Arrange
        var command = new ParseVoiceBrewLogCommand(null!, "audio/webm");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.AudioStream);
    }
}
