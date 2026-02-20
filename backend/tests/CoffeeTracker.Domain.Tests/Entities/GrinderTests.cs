using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class GrinderTests
{
    [Fact]
    public void Create_WhenNameIsValid_CreatesGrinderWithNormalizedName()
    {
        // Arrange
        const string name = "  Kawa Grinders  ";

        // Act
        var grinder = Grinder.Create(name);

        // Assert
        grinder.Id.Should().NotBeEmpty();
        grinder.Name.Should().Be("Kawa Grinders");
    }

    [Fact]
    public void Create_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        const string invalidName = " ";

        // Act
        Action act = () => Grinder.Create(invalidName);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Update_WhenNameIsValid_UpdatesName()
    {
        // Arrange
        var grinder = Grinder.Create("Kawa");

        // Act
        grinder.Update("  Kawa Grinders  ");

        // Assert
        grinder.Name.Should().Be("Kawa Grinders");
    }

    [Fact]
    public void Update_WhenNameIsWhitespace_ThrowsArgumentException()
    {
        // Arrange
        var grinder = Grinder.Create("Kawa");

        // Act
        Action act = () => grinder.Update(" ");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }
}
