using CoffeeTracker.Domain.Entities;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class CountryTests
{
    [Fact]
    public void Create_WhenCalledWithNameOnly_SetsDefaultIsoCodes()
    {
        // Act
        var country = Country.Create("Kenya");

        // Assert
        country.Id.Should().NotBe(Guid.Empty);
        country.Name.Should().Be("Kenya");
        country.IsoAlpha2.Should().BeEmpty();
        country.IsoNumericCode.Should().BeEmpty();
    }

    [Fact]
    public void Create_WhenCalledWithIsoCodes_SetsNormalizedValues()
    {
        // Act
        var country = Country.Create(" Ethiopia ", "et", "231");

        // Assert
        country.Id.Should().NotBe(Guid.Empty);
        country.Name.Should().Be("Ethiopia");
        country.IsoAlpha2.Should().Be("ET");
        country.IsoNumericCode.Should().Be("231");
    }

    [Fact]
    public void Create_WhenNameContainsWhitespace_StoresTrimmedName()
    {
        // Act
        var country = Country.Create("  Colombia  ");

        // Assert
        country.Name.Should().Be("Colombia");
    }
}
