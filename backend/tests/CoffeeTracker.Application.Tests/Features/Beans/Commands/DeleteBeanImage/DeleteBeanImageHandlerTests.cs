using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.DeleteBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class DeleteBeanImageHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanHasImage_RemovesStoredImage()
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
        bean.SetImage("bean.png", [1, 2, 3]);
        await Insert(bean);

        var command = new DeleteBeanImageCommand(bean.Id);

        // Act
        await Send(command);

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        updatedBean.ImageFileName.Should().BeNull();
        updatedBean.ImageData.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new DeleteBeanImageCommand(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
