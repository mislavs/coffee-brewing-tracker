using CoffeeTracker.Application.Features.Roasters.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.CreateRoaster;

public class CreateRoasterValidatorTests
{
    private readonly CreateRoasterValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateRoasterCommand(string.Empty, "City", "Country");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new CreateRoasterCommand("Kawa", "City", "Country");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }
}
