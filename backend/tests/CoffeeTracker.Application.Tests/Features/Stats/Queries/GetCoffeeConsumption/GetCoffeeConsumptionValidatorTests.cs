using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Application.Features.Stats.Queries;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Stats.Queries.GetCoffeeConsumption;

public class GetCoffeeConsumptionValidatorTests
{
    private readonly GetCoffeeConsumptionValidator _sut = new();

    [Fact]
    public void Validate_WhenQueryIsValid_ShouldNotHaveErrors()
    {
        // Arrange
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 1, 31),
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenEndDatePrecedesStartDate_ShouldHaveError()
    {
        // Arrange
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 2, 1),
            new DateOnly(2026, 1, 31),
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(candidate => candidate.To)
            .WithErrorMessage("The end date must be on or after the start date.");
    }

    [Fact]
    public void Validate_WhenRangeIsAtMaximumLength_ShouldNotHaveErrors()
    {
        // Arrange
        var from = new DateOnly(2026, 1, 1);
        var query = new GetCoffeeConsumptionQuery(
            from,
            from.AddDays(365),
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenRangeExceedsMaximumLength_ShouldHaveError()
    {
        // Arrange
        var from = new DateOnly(2026, 1, 1);
        var query = new GetCoffeeConsumptionQuery(
            from,
            from.AddDays(366),
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(candidate => candidate.To)
            .WithErrorMessage("The date range cannot exceed 366 days.");
    }

    [Fact]
    public void Validate_WhenEndDateIsMaximumValue_ShouldHaveError()
    {
        // Arrange
        var query = new GetCoffeeConsumptionQuery(
            DateOnly.MaxValue,
            DateOnly.MaxValue,
            CoffeeConsumptionGranularity.Daily,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(candidate => candidate.To)
            .WithErrorMessage("The end date is outside the supported range.");
    }

    [Fact]
    public void Validate_WhenGranularityIsUnknown_ShouldHaveError()
    {
        // Arrange
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 1, 31),
            (CoffeeConsumptionGranularity)999,
            "UTC");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(candidate => candidate.Granularity);
    }

    [Fact]
    public void Validate_WhenTimeZoneIsUnknown_ShouldHaveError()
    {
        // Arrange
        var query = new GetCoffeeConsumptionQuery(
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 1, 31),
            CoffeeConsumptionGranularity.Daily,
            "Not/A-Time-Zone");

        // Act
        var result = _sut.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(candidate => candidate.TimeZone)
            .WithErrorMessage("The time zone is not recognized.");
    }
}
