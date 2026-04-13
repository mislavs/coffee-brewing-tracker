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
        const string websiteUrl = "  https://kawa.example.com  ";
        var countryId = Guid.NewGuid();

        // Act
        var roaster = Roaster.Create(name, city, countryId, websiteUrl);

        // Assert
        roaster.Id.Should().NotBeEmpty();
        roaster.Name.Should().Be("Kawa");
        roaster.City.Should().Be("Warsaw");
        roaster.CountryId.Should().Be(countryId);
        roaster.WebsiteUrl.Should().Be("https://kawa.example.com");
    }

    [Fact]
    public void Create_WhenOptionalValuesAreWhitespace_SetsOptionalValuesToNull()
    {
        // Arrange
        const string name = "Kawa";

        // Act
        var roaster = Roaster.Create(name, "   ", null, "   ");

        // Assert
        roaster.Name.Should().Be("Kawa");
        roaster.City.Should().BeNull();
        roaster.CountryId.Should().BeNull();
        roaster.WebsiteUrl.Should().BeNull();
    }

    [Fact]
    public void Create_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        const string invalidName = " ";

        // Act
        Action act = () => Roaster.Create(invalidName, "City", Guid.NewGuid());

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Update_WhenValuesAreValid_UpdatesWithNormalizedValues()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", Guid.NewGuid());
        var updatedCountryId = Guid.NewGuid();

        // Act
        roaster.Update("  Kawa Roasters  ", "  Krakow  ", updatedCountryId, "  https://kawaroasters.example.com  ");

        // Assert
        roaster.Name.Should().Be("Kawa Roasters");
        roaster.City.Should().Be("Krakow");
        roaster.CountryId.Should().Be(updatedCountryId);
        roaster.WebsiteUrl.Should().Be("https://kawaroasters.example.com");
    }

    [Fact]
    public void Update_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", Guid.NewGuid());

        // Act
        Action act = () => roaster.Update(" ", "City", Guid.NewGuid());

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void SetLogo_WhenValuesAreValid_SetsLogoProperties()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
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
        var roaster = Roaster.Create("Kawa", "Warsaw", null);

        // Act
        Action act = () => roaster.SetLogo("logo.png", []);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("data");
    }

    [Fact]
    public void SetLogo_WhenFileNameExceedsMaxLength_ThrowsArgumentException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var fileName = $"{new string('a', 252)}.png";

        // Act
        Action act = () => roaster.SetLogo(fileName, [1, 2, 3]);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("fileName");
    }

    [Fact]
    public void RemoveLogo_WhenLogoExists_ClearsLogoProperties()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        roaster.SetLogo("logo.png", [1, 2, 3]);

        // Act
        roaster.RemoveLogo();

        // Assert
        roaster.LogoFileName.Should().BeNull();
        roaster.LogoData.Should().BeNull();
    }
}
