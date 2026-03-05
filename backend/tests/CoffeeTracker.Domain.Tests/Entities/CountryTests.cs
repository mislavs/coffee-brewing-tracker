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

    [Fact]
    public void Create_WhenIsoAlpha2IsWhitespace_StoresEmptyIsoAlpha2()
    {
        // Act
        var country = Country.Create("Kenya", "   ", "404");

        // Assert
        country.IsoAlpha2.Should().BeEmpty();
    }

    [Theory]
    [InlineData("E")]
    [InlineData("ETH")]
    public void Create_WhenIsoAlpha2LengthIsInvalid_ThrowsArgumentException(string isoAlpha2)
    {
        // Act
        Action act = () => Country.Create("Ethiopia", isoAlpha2, "231");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("value");
    }

    [Fact]
    public void Create_WhenIsoNumericCodeIsWhitespace_StoresEmptyIsoNumericCode()
    {
        // Act
        var country = Country.Create("Kenya", "KE", "   ");

        // Assert
        country.IsoNumericCode.Should().BeEmpty();
    }

    [Theory]
    [InlineData("12")]
    [InlineData("1234")]
    [InlineData("12A")]
    public void Create_WhenIsoNumericCodeIsInvalid_ThrowsArgumentException(string isoNumericCode)
    {
        // Act
        Action act = () => Country.Create("Ethiopia", "ET", isoNumericCode);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("value");
    }
}
