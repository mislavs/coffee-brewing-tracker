using CoffeeTracker.Application.Features.Roasters.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.DeleteRoaster;

[Collection(nameof(IntegrationTestsCollection))]
public class DeleteRoasterHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoasterHasNoBeans_DeletesRoaster()
    {
        // Arrange
        var roaster = Roaster.Create("Unused roaster", null, null);
        await Insert(roaster);
        var command = new DeleteRoasterCommand(roaster.Id);

        // Act
        await Send(command);

        // Assert
        var deletedRoaster = await DbContext.Roasters
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);

        deletedRoaster.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new DeleteRoasterCommand(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WhenRoasterHasBeans_ThrowsConflictExceptionAndKeepsData()
    {
        // Arrange
        var roaster = Roaster.Create("Used roaster", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            "Used bean",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
        await Insert(bean);

        var command = new DeleteRoasterCommand(roaster.Id);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should()
            .ThrowAsync<ConflictException>()
            .WithMessage("Roaster cannot be deleted because it has beans.");

        var existingRoaster = await DbContext.Roasters
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);
        var existingBean = await DbContext.Beans
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        existingRoaster.Should().NotBeNull();
        existingBean.Should().NotBeNull();
    }
}
