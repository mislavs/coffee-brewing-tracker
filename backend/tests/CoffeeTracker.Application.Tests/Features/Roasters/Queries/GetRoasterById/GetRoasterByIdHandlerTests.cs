using System;
using System.Threading.Tasks;
using CoffeeTracker.Application.Features.Roasters.Queries;
using CoffeeTracker.Domain.Entities;
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
