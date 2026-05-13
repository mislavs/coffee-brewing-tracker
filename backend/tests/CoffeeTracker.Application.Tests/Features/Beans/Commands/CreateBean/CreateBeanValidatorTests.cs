using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Enums;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.CreateBean;

public class CreateBeanValidatorTests
{
    private readonly CreateBeanValidator _sut = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Name = string.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Name);
    }

    [Fact]
    public void Validate_WhenRoasterIdIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { RoasterId = Guid.Empty };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.RoasterId);
    }

    [Fact]
    public void Validate_WhenBagWeightIsZero_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { BagWeight = 0m };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.BagWeight);
    }

    [Fact]
    public void Validate_WhenPriceIsNegative_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Price = -1m };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Price);
    }

    [Fact]
    public void Validate_WhenOriginTypeIsInvalid_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { OriginType = (OriginType)999 };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.OriginType);
    }

    [Fact]
    public void Validate_WhenRoastProfileIsInvalid_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { RoastProfile = (RoastProfile)999 };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.RoastProfile);
    }

    [Fact]
    public void Validate_WhenRegionIsTooLong_ShouldHaveValidationError()
    {
        // Arrange
        var command = CreateValidCommand() with { Region = new string('x', 201) };

        // Act
        var result = _sut.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(entry => entry.Region);
    }

    private static CreateBeanCommand CreateValidCommand()
    {
        return new CreateBeanCommand(
            "Kenya AB",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Guid.NewGuid()],
            "SL28",
            "Washed",
            RoastProfile.Filter,
            new DateOnly(2026, 2, 1),
            1800,
            250m,
            35m,
            ["Blackcurrant"]);
    }
}
