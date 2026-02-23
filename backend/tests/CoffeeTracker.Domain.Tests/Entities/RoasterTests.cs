using CoffeeTracker.Domain.Entities;
using FluentAssertions;

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

    [Fact]
    public void SetLogo_WhenValuesAreValid_SetsLogoProperties()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
        var data = new byte[] { 1, 2, 3 };

        // Act
        roaster.SetLogo("logo.png", data);

        // Assert
        roaster.LogoFileName.Should().Be("logo.png");
        roaster.LogoData.Should().Equal(1, 2, 3);
    }

    [Fact]
    public void SetLogo_WhenDataIsEmpty_ThrowsArgumentException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");

        // Act
        Action act = () => roaster.SetLogo("logo.png", []);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("data");
    }

    [Fact]
    public void RemoveLogo_WhenLogoExists_ClearsLogoProperties()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
        roaster.SetLogo("logo.png", [1, 2, 3]);

        // Act
        roaster.RemoveLogo();

        // Assert
        roaster.LogoFileName.Should().BeNull();
        roaster.LogoData.Should().BeNull();
    }
}
