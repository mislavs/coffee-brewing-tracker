using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class BrewerTests
{
    [Fact]
    public void Create_WhenNameIsValid_CreatesBrewerWithNormalizedName()
    {
        // Arrange
        const string name = "  Kawa Brewers  ";

        // Act
        var brewer = Brewer.Create(name);

        // Assert
        brewer.Id.Should().NotBeEmpty();
        brewer.Name.Should().Be("Kawa Brewers");
    }

    [Fact]
    public void Create_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        const string invalidName = " ";

        // Act
        Action act = () => Brewer.Create(invalidName);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Update_WhenNameIsValid_UpdatesName()
    {
        // Arrange
        var brewer = Brewer.Create("Kawa");

        // Act
        brewer.Update("  Kawa Brewers  ");

        // Assert
        brewer.Name.Should().Be("Kawa Brewers");
    }

    [Fact]
    public void Update_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        var brewer = Brewer.Create("Kawa");

        // Act
        Action act = () => brewer.Update(" ");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }
}
