using CoffeeTracker.Application.Features.Recipes.Commands;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Recipes.Commands.DeleteRecipe;

public class DeleteRecipeValidatorTests
{
    private readonly DeleteRecipeValidator _sut = new();

    [Fact]
    public void Validate_WhenIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = new DeleteRecipeCommand(Guid.Empty);

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Id);
    }

    [Fact]
    public void Validate_WhenIdIsProvided_ShouldNotHaveValidationError()
    {
        // Arrange
        var command = new DeleteRecipeCommand(Guid.NewGuid());

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(entry => entry.Id);
    }
}
