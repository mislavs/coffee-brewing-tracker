using CoffeeTracker.Application.Features.Roasters.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Commands.UploadRoasterLogo;

[Collection(nameof(IntegrationTestsCollection))]
public class UploadRoasterLogoHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Theory]
    [InlineData("image/png", ".png")]
    [InlineData("image/jpeg", ".jpg")]
    [InlineData("image/webp", ".webp")]
    [InlineData("image/svg+xml", ".svg")]
    public async Task Handle_WhenCommandIsValid_SavesNormalizedExtension(string contentType, string expectedExtension)
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var command = new UploadRoasterLogoCommand(
            roaster.Id,
            "my.logo.name.any",
            contentType,
            [1, 2, 3]);

        // Act
        await Send(command);

        // Assert
        var updatedRoaster = await DbContext.Roasters
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);

        updatedRoaster.LogoFileName.Should().Be($"my.logo.name{expectedExtension}");
        updatedRoaster.LogoData.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public async Task Handle_WhenFileNameResolvesToEmpty_UsesDefaultFileName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var command = new UploadRoasterLogoCommand(
            roaster.Id,
            ".png",
            "image/png",
            [1, 2, 3]);

        // Act
        await Send(command);

        // Assert
        var updatedRoaster = await DbContext.Roasters
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);

        updatedRoaster.LogoFileName.Should().Be("roaster-logo.png");
    }

    [Fact]
    public async Task Handle_WhenFileNameIncludesPath_StoresSafeFileName()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var command = new UploadRoasterLogoCommand(
            roaster.Id,
            "..\\logos\\brand-image.jpeg",
            "image/jpeg",
            [7, 8, 9]);

        // Act
        await Send(command);

        // Assert
        var updatedRoaster = await DbContext.Roasters
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == roaster.Id,
                TestContext.Current.CancellationToken);

        updatedRoaster.LogoFileName.Should().Be("brand-image.jpg");
        updatedRoaster.LogoData.Should().Equal([7, 8, 9]);
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UploadRoasterLogoCommand(
            Guid.NewGuid(),
            "logo.png",
            "image/png",
            [1, 2, 3]);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
