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
        var command = new CreateRoasterCommand(string.Empty, "City", null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenNameIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new CreateRoasterCommand("Kawa", "City", null, "https://kawa.example.com");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
        result.ShouldNotHaveValidationErrorFor(entry => entry.WebsiteUrl);
    }

    [Fact]
    public void Validate_WhenWebsiteUrlIsTooLong_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateRoasterCommand(
            "Kawa",
            "City",
            null,
            $"https://{new string('a', 2040)}.com");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.WebsiteUrl);
    }

    [Fact]
    public void Validate_WhenWebsiteUrlIsInvalid_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreateRoasterCommand("Kawa", "City", null, "not-a-url");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.WebsiteUrl);
    }
}
