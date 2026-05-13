using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Beans.Queries.GetBeanById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBeanByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanExists_ReturnsBeanWithRoasterAndFlavorNotes()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var citrus = FlavorNote.Create("Citrus");
        var chocolate = FlavorNote.Create("Chocolate");
        await Insert(roaster);
        await Insert(kenya);
        await InsertMany([citrus, chocolate]);

        var bean = Bean.Create(
            "Kenya AB",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            "SL28",
            "Washed",
            RoastProfile.Filter,
            new DateOnly(2026, 2, 1),
            1800,
            250m,
            40m,
            region: "Nyeri");
        bean.SetImage("kenya-ab.png", [1, 2, 3]);
        bean.SetFlavorNotes([citrus, chocolate]);
        await Insert(bean);

        var query = new GetBeanByIdQuery(bean.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(bean.Id);
        result.Name.Should().Be("Kenya AB");
        result.RoasterId.Should().Be(roaster.Id);
        result.RoasterName.Should().Be("Kawa");
        result.Region.Should().Be("Nyeri");
        result.OriginCountries.Should().ContainSingle();
        result.OriginCountries.Single().Id.Should().Be(kenya.Id);
        result.OriginCountries.Single().Name.Should().Be("Kenya");
        result.PricePerKg.Should().Be(160m);
        result.RemainingQuantity.Should().Be(250m);
        result.HasImage.Should().BeTrue();
        result.ImageUrl.Should().Be($"/api/beans/{bean.Id}/image");
        result.FlavorNotes.Select(entity => entity.Name)
            .Should()
            .Contain(["Citrus", "Chocolate"]);
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetBeanByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
