using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.UploadBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class UploadBeanImageHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Theory]
    [InlineData("image/png", ".png")]
    [InlineData("image/jpeg", ".jpg")]
    [InlineData("image/webp", ".webp")]
    public async Task Handle_WhenCommandIsValid_SavesNormalizedExtension(string contentType, string expectedExtension)
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var bean = CreateBean(roaster.Id);
        await Insert(bean);

        var command = new UploadBeanImageCommand(
            bean.Id,
            "my.bean.photo.any",
            contentType,
            [1, 2, 3]);

        // Act
        await Send(command);

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        updatedBean.ImageFileName.Should().Be($"my.bean.photo{expectedExtension}");
        updatedBean.ImageData.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public async Task Handle_WhenFileNameResolvesToEmpty_UsesDefaultFileName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var bean = CreateBean(roaster.Id);
        await Insert(bean);

        var command = new UploadBeanImageCommand(
            bean.Id,
            ".png",
            "image/png",
            [1, 2, 3]);

        // Act
        await Send(command);

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        updatedBean.ImageFileName.Should().Be("bean-image.png");
    }

    [Fact]
    public async Task Handle_WhenFileNameIncludesPath_StoresSafeFileName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);
        var bean = CreateBean(roaster.Id);
        await Insert(bean);

        var command = new UploadBeanImageCommand(
            bean.Id,
            "..\\images\\bag-shot.jpeg",
            "image/jpeg",
            [7, 8, 9]);

        // Act
        await Send(command);

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        updatedBean.ImageFileName.Should().Be("bag-shot.jpg");
        updatedBean.ImageData.Should().Equal([7, 8, 9]);
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UploadBeanImageCommand(
            Guid.NewGuid(),
            "image.png",
            "image/png",
            [1, 2, 3]);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    private static Bean CreateBean(Guid roasterId)
    {
        return Bean.Create(
            "Kenya AB",
            roasterId,
            OriginType.Blend,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
    }
}
