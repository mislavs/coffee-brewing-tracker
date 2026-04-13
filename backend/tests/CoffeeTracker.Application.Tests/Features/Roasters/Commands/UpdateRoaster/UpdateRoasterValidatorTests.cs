using CoffeeTracker.Application.Features.Roasters.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.UpdateRoaster;

public class UpdateRoasterValidatorTests
{
    private readonly UpdateRoasterValidator _sut = new();

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.Empty, "Kawa", "City", null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.NewGuid(), string.Empty, "City", null);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenIdAndNameAreProvided_ShouldNotHaveValidationErrors()
    {
        // Arrange
        var command = new UpdateRoasterCommand(
            Guid.NewGuid(),
            "Kawa",
            "City",
            null,
            "https://kawa.example.com");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Id);
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
        result.ShouldNotHaveValidationErrorFor(entry => entry.WebsiteUrl);
    }

    [Fact]
    public void Validate_WhenWebsiteUrlIsTooLong_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateRoasterCommand(
            Guid.NewGuid(),
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
        var command = new UpdateRoasterCommand(Guid.NewGuid(), "Kawa", "City", null, "not-a-url");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.WebsiteUrl);
    }
}
