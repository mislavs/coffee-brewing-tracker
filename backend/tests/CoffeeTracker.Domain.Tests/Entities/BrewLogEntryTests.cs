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
            12m,
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
            12m,
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

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Update_WhenAdjustmentIdeasIsBlank_NormalizesToNull(string? adjustmentIdeas)
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
            12m,
            180,
            null,
            "Sweet and balanced",
            "Try finer grind",
            DateTime.UtcNow);

        // Act
        brewLogEntry.Update(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            null,
            19m,
            305m,
            94m,
            11m,
            175,
            null,
            "Updated notes",
            adjustmentIdeas,
            DateTime.UtcNow);

        // Assert
        brewLogEntry.AdjustmentIdeas.Should().BeNull();
    }
}
