using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Beans.Queries.GetBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBeanImageHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Theory]
    [InlineData("bean.png", "image/png")]
    [InlineData("bean.jpg", "image/jpeg")]
    [InlineData("bean.jpeg", "image/jpeg")]
    [InlineData("bean.webp", "image/webp")]
    [InlineData("bean.gif", "application/octet-stream")]
    public async Task Handle_WhenBeanHasImage_ReturnsInferredContentType(string fileName, string expectedContentType)
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var bean = Bean.Create(
            "Kenya AB",
            roaster.Id,
            OriginType.Blend,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        bean.SetImage(fileName, [1, 2, 3]);
        await Insert(bean);

        var query = new GetBeanImageQuery(bean.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.FileName.Should().Be(fileName);
        result.ContentType.Should().Be(expectedContentType);
        result.Data.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public async Task Handle_WhenBeanHasNoImage_ThrowsNotFoundException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var bean = Bean.Create(
            "Kenya AB",
            roaster.Id,
            OriginType.Blend,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        await Insert(bean);

        var query = new GetBeanImageQuery(bean.Id);

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{bean.Id}*does not have an image*");
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var missingBeanId = Guid.NewGuid();
        var query = new GetBeanImageQuery(missingBeanId);

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{missingBeanId}*was not found*");
    }
}
