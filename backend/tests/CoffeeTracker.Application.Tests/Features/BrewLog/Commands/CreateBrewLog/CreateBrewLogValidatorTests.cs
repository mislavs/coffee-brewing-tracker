using CoffeeTracker.Application.Features.BrewLog.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.CreateBrewLog;

public class CreateBrewLogValidatorTests
{
    private readonly CreateBrewLogValidator _sut = new();

    [Fact]
    public void Validate_WhenBeanIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { BeanId = Guid.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.BeanId);
    }

    [Fact]
    public void Validate_WhenBrewerIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { BrewerId = Guid.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.BrewerId);
    }

    [Fact]
    public void Validate_WhenGrinderIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { GrinderId = Guid.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.GrinderId);
    }

    [Fact]
    public void Validate_WhenDoseIsNotPositive_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Dose = 0m };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Dose);
    }

    [Fact]
    public void Validate_WhenWaterAmountIsNotPositive_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { WaterAmount = 0m };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.WaterAmount);
    }

    [Fact]
    public void Validate_WhenWaterTemperatureOutsideRange_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { WaterTemperature = 101m };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.WaterTemperature);
    }

    [Fact]
    public void Validate_WhenGrindSizeExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { GrindSize = new string('G', 11) };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.GrindSize);
    }

    [Fact]
    public void Validate_WhenBrewTimeSecondsIsNegative_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { BrewTimeSeconds = -1 };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.BrewTimeSeconds);
    }

    [Fact]
    public void Validate_WhenRatingOutsideRange_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Rating = 6 };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Rating);
    }

    [Fact]
    public void Validate_WhenNotesExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Notes = new string('N', 2001) };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Notes);
    }

    [Fact]
    public void Validate_WhenAdjustmentIdeasExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { AdjustmentIdeas = new string('A', 1001) };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.AdjustmentIdeas);
    }

    [Fact]
    public void Validate_WhenBrewedAtIsDefault_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { BrewedAt = default };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.BrewedAt);
    }

    [Fact]
    public void Validate_WhenAccessoryIdsContainEmptyGuid_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { AccessoryIds = [Guid.Empty] };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor("AccessoryIds[0]");
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

    private static CreateBrewLogCommand CreateValidCommand()
    {
        return new CreateBrewLogCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            [Guid.NewGuid()],
            18m,
            300m,
            93m,
            "12 clicks",
            180,
            4,
            "Sweet and balanced",
            "Try finer grind",
            DateTime.UtcNow);
    }
}
