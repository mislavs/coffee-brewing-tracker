using CoffeeTracker.Application.Features.Accessories.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Accessories.Queries.GetAccessoryById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetAccessoryByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenAccessoryExists_ReturnsAccessoryDtoWithBrewers()
    {
        // Arrange
        var brewerA = Brewer.Create("V60");
        var brewerB = Brewer.Create("Aeropress");
        await InsertMany([brewerA, brewerB]);

        var accessory = Accessory.Create("Paper Filters");
        accessory.SetCompatibleBrewers([brewerA, brewerB]);
        await Insert(accessory);

        var query = new GetAccessoryByIdQuery(accessory.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(accessory.Id);
        result.Name.Should().Be("Paper Filters");
        result.CompatibleBrewers.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("Aeropress", "V60");
    }

    [Fact]
    public async Task Handle_WhenAccessoryNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetAccessoryByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
