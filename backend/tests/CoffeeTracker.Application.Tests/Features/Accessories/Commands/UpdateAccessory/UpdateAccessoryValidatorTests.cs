using CoffeeTracker.Application.Features.Accessories.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Accessories.Commands.UpdateAccessory;

public class UpdateAccessoryValidatorTests
{
    private readonly UpdateAccessoryValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateAccessoryCommand(Guid.NewGuid(), string.Empty, null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new UpdateAccessoryCommand(Guid.NewGuid(), "Paper Filters", null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateAccessoryCommand(Guid.NewGuid(), new string('A', 201), null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateAccessoryCommand(Guid.Empty, "Paper Filters", null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }
}
