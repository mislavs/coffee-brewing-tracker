using CoffeeTracker.Application.Features.Grinders.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Grinders.Queries.GetGrinderById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetGrinderByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenGrinderExists_ReturnsDerivedBrewStatistics()
    {
        // Arrange
        var grinder = Grinder.Create("Kawa Grinders");
        await Insert(grinder);
        var roaster = Roaster.Create("Roaster grinder", null, null);
        await Insert(roaster);
        var bean = Bean.Create(
            "Bean grinder",
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
        var brewer = Brewer.Create("V60");
        await Insert(bean);
        await Insert(brewer);

        await InsertMany(
        [
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 18m, 300m, null, 10m, null, BrewRating.Good, null, null, DateTime.UtcNow.AddDays(-3)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 20m, 320m, null, 10m, null, BrewRating.Excellent, null, null, DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(bean.Id, brewer.Id, grinder.Id, null, 19m, 300m, null, 8m, null, BrewRating.Average, null, null, DateTime.UtcNow.AddDays(-1))
        ]);

        var query = new GetGrinderByIdQuery(grinder.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(grinder.Id);
        result.Name.Should().Be("Kawa Grinders");
        result.TotalBrews.Should().Be(3);
        result.TotalCoffeeGround.Should().Be(57m);
        result.MostCommonGrindSetting.Should().Be(10m);
        result.GrindSettingMin.Should().Be(8m);
        result.GrindSettingMax.Should().Be(10m);
        result.BestRatedGrindSetting.Should().Be(10m);
    }

    [Fact]
    public async Task Handle_WhenGrinderNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetGrinderByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
