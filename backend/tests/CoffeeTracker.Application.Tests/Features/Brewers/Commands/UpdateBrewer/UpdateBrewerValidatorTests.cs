using CoffeeTracker.Application.Features.Brewers.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Commands.UpdateBrewer;

public class UpdateBrewerValidatorTests
{
    private readonly UpdateBrewerValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateBrewerCommand(Guid.NewGuid(), string.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new UpdateBrewerCommand(Guid.NewGuid(), "Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateBrewerCommand(Guid.NewGuid(), new string('A', 201));

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateBrewerCommand(Guid.Empty, "Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }
}
