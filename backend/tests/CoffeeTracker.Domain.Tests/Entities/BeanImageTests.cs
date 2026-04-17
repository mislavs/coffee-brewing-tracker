using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Entities;

public class BeanImageTests
{
    [Fact]
    public void SetImage_WhenImageIsValid_SavesFileNameAndData()
    {
        // Arrange
        var bean = CreateBean();

        // Act
        bean.SetImage("bag-photo.png", [1, 2, 3]);

        // Assert
        bean.ImageFileName.Should().Be("bag-photo.png");
        bean.ImageData.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public void SetImage_WhenImageDataIsEmpty_ThrowsArgumentException()
    {
        // Arrange
        var bean = CreateBean();

        // Act
        Action act = () => bean.SetImage("bag-photo.png", []);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*Image data cannot be empty*");
    }

    [Fact]
    public void SetImage_WhenImageDataIsEmpty_DoesNotMutateImageFileName()
    {
        // Arrange
        var bean = CreateBean();
        bean.SetImage("existing.png", [1, 2, 3]);

        // Act
        Action act = () => bean.SetImage("new-image.png", []);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*Image data cannot be empty*");
        bean.ImageFileName.Should().Be("existing.png");
        bean.ImageData.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public void SetImage_WhenFileNameExceedsMaxLength_DoesNotMutateImageFileName()
    {
        // Arrange
        var bean = CreateBean();
        bean.SetImage("existing.png", [1, 2, 3]);
        var fileName = $"{new string('a', 252)}.png";

        // Act
        Action act = () => bean.SetImage(fileName, [4, 5, 6]);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("fileName");
        bean.ImageFileName.Should().Be("existing.png");
        bean.ImageData.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public void RemoveImage_WhenBeanHasImage_ClearsFileNameAndData()
    {
        // Arrange
        var bean = CreateBean();
        bean.SetImage("bag-photo.png", [1, 2, 3]);

        // Act
        bean.RemoveImage();

        // Assert
        bean.ImageFileName.Should().BeNull();
        bean.ImageData.Should().BeNull();
    }

    private static Bean CreateBean()
    {
        return Bean.Create(
            "Kenya AB",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Country.Create("Kenya", "KE", "404")],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
    }
}
