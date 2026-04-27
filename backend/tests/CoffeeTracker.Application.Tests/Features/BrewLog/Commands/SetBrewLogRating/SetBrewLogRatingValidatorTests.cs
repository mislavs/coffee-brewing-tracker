using CoffeeTracker.Application.Features.BrewLog.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.SetBrewLogRating;

public class SetBrewLogRatingValidatorTests
{
    private readonly SetBrewLogRatingValidator _sut = new();

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Id = Guid.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void Validate_WhenRatingIsOutsideRange_ShouldHaveValidationError(int rating)
    {
        // Arrange
        var command = CreateValidCommand() with { Rating = rating };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Rating);
    }

    [Fact]
    public void Validate_WhenRatingIsNull_ShouldNotHaveValidationErrors()
    {
        // Arrange
        var command = CreateValidCommand() with { Rating = null };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenInputIsValid_ShouldNotHaveValidationErrors()
    {
        // Arrange
        var command = CreateValidCommand();

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static SetBrewLogRatingCommand CreateValidCommand()
    {
        return new SetBrewLogRatingCommand(Guid.NewGuid(), 4);
    }
}
