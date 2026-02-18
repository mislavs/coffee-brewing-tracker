using System;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CoffeeTracker.Domain.Tests.Entities;

public class RoasterTests
{
    [Fact]
    public void Create_WhenValuesAreValid_CreatesRoasterWithNormalizedValues()
    {
        // Arrange
        const string name = "  Kawa  ";
        const string city = "  Warsaw  ";
        const string country = "  Poland  ";

        // Act
        var roaster = Roaster.Create(name, city, country);

        // Assert
        roaster.Id.Should().NotBeEmpty();
        roaster.Name.Should().Be("Kawa");
        roaster.City.Should().Be("Warsaw");
        roaster.Country.Should().Be("Poland");
    }

    [Fact]
    public void Create_WhenOptionalValuesAreWhitespace_SetsOptionalValuesToNull()
    {
        // Arrange
        const string name = "Kawa";

        // Act
        var roaster = Roaster.Create(name, "   ", "");

        // Assert
        roaster.Name.Should().Be("Kawa");
        roaster.City.Should().BeNull();
        roaster.Country.Should().BeNull();
    }

    [Fact]
    public void Create_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        const string invalidName = " ";

        // Act
        Action act = () => Roaster.Create(invalidName, "City", "Country");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Update_WhenValuesAreValid_UpdatesWithNormalizedValues()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");

        // Act
        roaster.Update("  Kawa Roasters  ", "  Krakow  ", "  Poland  ");

        // Assert
        roaster.Name.Should().Be("Kawa Roasters");
        roaster.City.Should().Be("Krakow");
        roaster.Country.Should().Be("Poland");
    }

    [Fact]
    public void Update_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");

        // Act
        Action act = () => roaster.Update(" ", "City", "Country");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }
}
