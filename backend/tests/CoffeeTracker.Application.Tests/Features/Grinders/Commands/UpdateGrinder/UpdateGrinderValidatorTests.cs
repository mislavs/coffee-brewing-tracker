using CoffeeTracker.Application.Features.Grinders.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Commands.UpdateGrinder;

public class UpdateGrinderValidatorTests
{
    private readonly UpdateGrinderValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateGrinderCommand(Guid.NewGuid(), string.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new UpdateGrinderCommand(Guid.NewGuid(), "Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateGrinderCommand(Guid.NewGuid(), new string('A', 201));

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateGrinderCommand(Guid.Empty, "Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }
}
