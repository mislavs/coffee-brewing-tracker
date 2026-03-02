using CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.ParseVoiceBrewLog;

public class ParseVoiceBrewLogValidatorTests
{
    private readonly ParseVoiceBrewLogValidator _sut = new();

    [Fact]
    public void Validate_WhenAudioStreamIsNotNull_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new ParseVoiceBrewLogCommand(new MemoryStream([1, 2, 3]));

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenAudioStreamIsNull_ShouldHaveValidationError()
    {
        // Arrange
        var command = new ParseVoiceBrewLogCommand(null!);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.AudioStream);
    }
}
