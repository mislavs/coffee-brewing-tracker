using CoffeeTracker.Application.Features.BrewLog.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.DeleteBrewLog;

public class DeleteBrewLogValidatorTests
{
    private readonly DeleteBrewLogValidator _sut = new();

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new DeleteBrewLogCommand(Guid.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }

    [Fact]
    public void Validate_WhenIdIsProvided_ShouldNotHaveValidationErrors()
    {
        // Arrange
        var command = new DeleteBrewLogCommand(Guid.NewGuid());

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
