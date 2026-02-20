using CoffeeTracker.Application.Features.Grinders.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Commands.CreateGrinder;

public class CreateGrinderValidatorTests
{
    private readonly CreateGrinderValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateGrinderCommand(string.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new CreateGrinderCommand("Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateGrinderCommand(new string('A', 201));

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }
}
