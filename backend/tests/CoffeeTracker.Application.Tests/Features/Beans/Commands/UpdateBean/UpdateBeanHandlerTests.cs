using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.UpdateBean;

[Collection(nameof(IntegrationTestsCollection))]
public class UpdateBeanHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanExists_UpdatesPropertiesAndFlavorNotes()
    {
        // Arrange
        var roasterA = Roaster.Create("Roaster A", "City A", null);
        var roasterB = Roaster.Create("Roaster B", "City B", null);
        var citrus = FlavorNote.Create("Citrus");
        var chocolate = FlavorNote.Create("Chocolate");
        var floral = FlavorNote.Create("Floral");
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var brazil = Country.Create("Brazil", string.Empty, string.Empty);
        var ethiopia = Country.Create("Ethiopia", string.Empty, string.Empty);
        await InsertMany([roasterA, roasterB]);
        await InsertMany([citrus, chocolate, floral]);
        await InsertMany([kenya, brazil, ethiopia]);

        var bean = Bean.Create(
            "Old Bean",
            roasterA.Id,
            OriginType.SingleOrigin,
            [kenya],
            "Old Variety",
            "Washed",
            RoastProfile.Filter,
            new DateOnly(2026, 1, 1),
            1700,
            250m,
            35m);
        bean.SetFlavorNotes([citrus, chocolate]);
        await Insert(bean);

        var command = new UpdateBeanCommand(
            bean.Id,
            "Updated Bean",
            roasterB.Id,
            OriginType.Blend,
            [brazil.Id, ethiopia.Id],
            "Bourbon",
            "Natural",
            RoastProfile.Espresso,
            new DateOnly(2026, 2, 1),
            1500,
            300m,
            45m,
            true,
            ["Floral"]);

        // Act
        await Send(command);

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .Include(entity => entity.OriginCountries)
            .Include(entity => entity.FlavorNotes)
            .FirstOrDefaultAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);

        updatedBean.Should().NotBeNull();
        updatedBean!.Name.Should().Be("Updated Bean");
        updatedBean.RoasterId.Should().Be(roasterB.Id);
        updatedBean.OriginType.Should().Be(OriginType.Blend);
        updatedBean.OriginCountries.Select(country => country.Name)
            .Should()
            .Contain(["Brazil", "Ethiopia"]);
        updatedBean.RoastProfile.Should().Be(RoastProfile.Espresso);
        updatedBean.FlavorNotes.Should().ContainSingle(entity => entity.Name == "Floral");
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var command = new UpdateBeanCommand(
            Guid.NewGuid(),
            "Updated Bean",
            Guid.NewGuid(),
            OriginType.SingleOrigin,
            [Guid.NewGuid()],
            "Bourbon",
            "Natural",
            RoastProfile.Filter,
            null,
            null,
            250m,
            30m,
            true,
            ["Citrus"]);

        // Act
        Func<Task> act = () => Send(command);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
