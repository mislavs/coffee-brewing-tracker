using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class BrewLogEntryTests
{
    [Fact]
    public void BrewRatio_WhenDoseAndWaterAmountAreValid_ReturnsComputedRatio()
    {
        // Arrange
        var brewLogEntry = BrewLogEntry.Create(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            18m,
            300m,
            93m,
            "12 clicks",
            180,
            null,
            "Sweet and balanced",
            "Try finer grind",
            DateTime.UtcNow);

        // Act
        var result = brewLogEntry.BrewRatio;

        // Assert
        result.Should().BeApproximately(16.67m, 0.01m);
    }

    [Fact]
    public void BrewRatio_WhenDoseIsZero_ReturnsNull()
    {
        // Arrange
        var brewLogEntry = BrewLogEntry.Create(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            0m,
            300m,
            93m,
            "12 clicks",
            180,
            null,
            "Sweet and balanced",
            "Try finer grind",
            DateTime.UtcNow);

        // Act
        var result = brewLogEntry.BrewRatio;

        // Assert
        result.Should().BeNull();
    }
}
