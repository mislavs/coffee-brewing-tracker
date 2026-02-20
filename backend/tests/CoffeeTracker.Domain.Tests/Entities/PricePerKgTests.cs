using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class PricePerKgTests
{
    [Fact]
    public void PricePerKg_WhenPriceAndBagWeightAreValid_ReturnsCalculatedValue()
    {
        // Arrange
        var bean = Bean.Create(
            "Kenya AB",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Country.Create("Kenya")],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);

        // Act
        var result = bean.PricePerKg;

        // Assert
        result.Should().Be(160m);
    }

    [Fact]
    public void PricePerKg_WhenPriceIsNull_ReturnsNull()
    {
        // Arrange
        var bean = Bean.Create(
            "Kenya AB",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Country.Create("Kenya")],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);

        // Act
        var result = bean.PricePerKg;

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void PricePerKg_WhenBagWeightIsZero_ReturnsNull()
    {
        // Arrange
        var bean = Bean.Create(
            "Kenya AB",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Country.Create("Kenya")],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            0m,
            40m);

        // Act
        var result = bean.PricePerKg;

        // Assert
        result.Should().BeNull();
    }
}
