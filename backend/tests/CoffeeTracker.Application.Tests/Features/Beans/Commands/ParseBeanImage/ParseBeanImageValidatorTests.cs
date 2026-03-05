using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.ParseBeanImage;

public class ParseBeanImageValidatorTests
{
    private readonly ParseBeanImageValidator _sut = new();

    [Fact]
    public void Validate_WhenInputIsValid_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new ParseBeanImageCommand(new MemoryStream([1, 2, 3]), "image/png");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenImageStreamIsNull_ShouldHaveValidationError()
    {
        // Arrange
        var command = new ParseBeanImageCommand(null!, "image/png");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.ImageStream);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WhenContentTypeIsEmpty_ShouldHaveValidationError(string contentType)
    {
        // Arrange
        var command = new ParseBeanImageCommand(new MemoryStream([1, 2, 3]), contentType);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.ContentType);
    }
}
