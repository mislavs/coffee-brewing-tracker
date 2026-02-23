using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Application.Features.BrewLog.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Beans.Queries.GetBeanById;

[Collection(nameof(IntegrationTestsCollection))]
public class RemainingQuantityTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanHasNoBrews_ReturnsFullBagWeightAsRemainingQuantity()
    {
        // Arrange
        var (bean, _, _) = await SeedRequiredEntities("remaining-no-brews", 500m);

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.RemainingQuantity.Should().Be(500m);
    }

    [Fact]
    public async Task Handle_WhenBeanHasSingleBrew_SubtractsDoseFromBagWeight()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("remaining-single", 500m);
        await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 18m));

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.RemainingQuantity.Should().Be(482m);
    }

    [Fact]
    public async Task Handle_WhenBeanHasMultipleBrews_SubtractsCumulativeDose()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("remaining-multiple", 500m);
        await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 18m));
        await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 15m));

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.RemainingQuantity.Should().Be(467m);
    }

    [Fact]
    public async Task Handle_WhenBrewDoseIsUpdated_RecalculatesRemainingQuantity()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("remaining-update", 500m);
        var brewLogId = await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 18m));

        await Send(new UpdateBrewLogCommand(
            brewLogId,
            bean.Id,
            brewer.Id,
            grinder.Id,
            null,
            null,
            20m,
            300m,
            93m,
            "10clicks",
            180,
            4,
            "Updated",
            null,
            DateTime.UtcNow));

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.RemainingQuantity.Should().Be(480m);
    }

    [Fact]
    public async Task Handle_WhenBrewIsDeleted_RecalculatesRemainingQuantity()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("remaining-delete", 500m);
        var firstBrewId = await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 18m));
        await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 15m));
        await Send(new DeleteBrewLogCommand(firstBrewId));

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.RemainingQuantity.Should().Be(485m);
    }

    [Fact]
    public async Task Handle_WhenListingBeans_IncludesRemainingQuantityInSummary()
    {
        // Arrange
        var (bean, brewer, grinder) = await SeedRequiredEntities("remaining-list", 500m);
        await Send(CreateBrewCommand(bean.Id, brewer.Id, grinder.Id, 18m));

        // Act
        var result = await Send(new GetBeansListQuery(null));

        // Assert
        var listedBean = result.Single(entity => entity.Id == bean.Id);
        listedBean.RemainingQuantity.Should().Be(482m);
    }

    private async Task<(Bean Bean, Brewer Brewer, Grinder Grinder)> SeedRequiredEntities(
        string suffix,
        decimal bagWeight)
    {
        var roaster = Roaster.Create($"Roaster {suffix}", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            $"Bean {suffix}",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            bagWeight,
            null);
        var brewer = Brewer.Create($"Brewer {suffix}");
        var grinder = Grinder.Create($"Grinder {suffix}");

        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        return (bean, brewer, grinder);
    }

    private static CreateBrewLogCommand CreateBrewCommand(Guid beanId, Guid brewerId, Guid grinderId, decimal dose)
    {
        return new CreateBrewLogCommand(
            beanId,
            brewerId,
            grinderId,
            null,
            null,
            dose,
            300m,
            93m,
            "10clicks",
            180,
            4,
            "Notes",
            null,
            DateTime.UtcNow);
    }
}
