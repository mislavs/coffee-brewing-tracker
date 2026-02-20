using CoffeeTracker.Application.Features.Brewers.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Commands.CreateBrewer;

public class CreateBrewerValidatorTests
{
    private readonly CreateBrewerValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateBrewerCommand(string.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new CreateBrewerCommand("Kawa");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameExceedsMaxLength_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateBrewerCommand(new string('A', 201));

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }
}
