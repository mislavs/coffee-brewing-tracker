using System;
using CoffeeTracker.Application.Features.Roasters.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.UpdateRoaster;

public class UpdateRoasterValidatorTests
{
    private readonly UpdateRoasterValidator _sut = new();

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.Empty, "Kawa", "City", "Country");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.NewGuid(), string.Empty, "City", "Country");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenIdAndNameAreProvided_ShouldNotHaveValidationErrors()
    {
        // Arrange
        var command = new UpdateRoasterCommand(Guid.NewGuid(), "Kawa", "City", "Country");

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Id);
        result.ShouldNotHaveValidationErrorFor(entry => entry.Name);
    }
}
