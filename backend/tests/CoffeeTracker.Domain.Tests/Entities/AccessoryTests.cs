using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class AccessoryTests
{
    [Fact]
    public void Create_WhenNameIsValid_CreatesAccessoryWithNormalizedName()
    {
        // Arrange
        const string name = "  Paper Filters  ";

        // Act
        var accessory = Accessory.Create(name);

        // Assert
        accessory.Id.Should().NotBeEmpty();
        accessory.Name.Should().Be("Paper Filters");
    }

    [Fact]
    public void Update_WhenNameIsValid_UpdatesName()
    {
        // Arrange
        var accessory = Accessory.Create("Filters");

        // Act
        accessory.Update("  Cone Filters  ");

        // Assert
        accessory.Name.Should().Be("Cone Filters");
    }

    [Fact]
    public void SetCompatibleBrewers_WhenBrewersProvided_SetsBrewers()
    {
        // Arrange
        var accessory = Accessory.Create("Filters");
        var brewers = new[] { Brewer.Create("V60"), Brewer.Create("Chemex") };

        // Act
        accessory.SetCompatibleBrewers(brewers);

        // Assert
        accessory.CompatibleBrewers.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("V60", "Chemex");
    }

    [Fact]
    public void SetCompatibleBrewers_WhenDuplicateBrewers_DeduplicatesById()
    {
        // Arrange
        var accessory = Accessory.Create("Filters");
        var brewer = Brewer.Create("V60");

        // Act
        accessory.SetCompatibleBrewers([brewer, brewer]);

        // Assert
        accessory.CompatibleBrewers.Should().ContainSingle();
    }

    [Fact]
    public void SetCompatibleBrewers_WhenNull_ClearsBrewers()
    {
        // Arrange
        var accessory = Accessory.Create("Filters");
        accessory.SetCompatibleBrewers([Brewer.Create("V60")]);

        // Act
        accessory.SetCompatibleBrewers(null);

        // Assert
        accessory.CompatibleBrewers.Should().BeEmpty();
    }

    [Fact]
    public void SetCompatibleBrewers_WhenCalledMultipleTimes_ReplacesBrewers()
    {
        // Arrange
        var accessory = Accessory.Create("Filters");
        accessory.SetCompatibleBrewers([Brewer.Create("V60"), Brewer.Create("Chemex")]);

        // Act
        accessory.SetCompatibleBrewers([Brewer.Create("Aeropress")]);

        // Assert
        accessory.CompatibleBrewers.Should().ContainSingle();
        accessory.CompatibleBrewers.Single().Name.Should().Be("Aeropress");
    }
}
