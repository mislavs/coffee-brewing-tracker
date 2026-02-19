using System;
using System.Linq;
using System.Threading.Tasks;
using CoffeeTracker.Application.Features.Roasters.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Queries.GetRoasterById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRoasterByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoasterExists_ReturnsRoasterDetails()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
        await Insert(roaster);
        var query = new GetRoasterByIdQuery(roaster.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(roaster.Id);
        result.Name.Should().Be("Kawa");
        result.City.Should().Be("Warsaw");
        result.Country.Should().Be("Poland");
        result.Beans.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenRoasterHasBeans_ReturnsBeanSummaries()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", "Poland");
        await Insert(roaster);
        var kenya = Country.Create("Kenya");
        var ethiopia = Country.Create("Ethiopia");
        await InsertMany([kenya, ethiopia]);

        var beanA = Bean.Create(
            "Zulu Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        var beanB = Bean.Create(
            "Alpha Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            [ethiopia],
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            40m);
        await InsertMany([beanA, beanB]);

        var query = new GetRoasterByIdQuery(roaster.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Beans.Should().HaveCount(2);
        result.Beans.Select(entry => entry.Name)
            .Should()
            .ContainInOrder("Alpha Bean", "Zulu Bean");
    }

    [Fact]
    public async Task Handle_WhenRoasterDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetRoasterByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
